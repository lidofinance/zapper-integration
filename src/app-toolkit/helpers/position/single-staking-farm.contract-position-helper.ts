import { Inject, Injectable } from '@nestjs/common';
import { BigNumberish } from 'ethers';
import { compact, isArray } from 'lodash';

import { APP_TOOLKIT, IAppToolkit } from '~app-toolkit/app-toolkit.interface';
import { ZERO_ADDRESS } from '~app-toolkit/constants/address';
import { EthersMulticall as Multicall } from '~multicall/multicall.ethers';
import { ContractType } from '~position/contract.interface';
import { WithMetaType } from '~position/display.interface';
import { ContractPosition, Token } from '~position/position.interface';
import { AppGroupsDefinition } from '~position/position.service';
import { claimable, supplied } from '~position/position.utils';
import { BaseToken } from '~position/token.interface';
import { Network } from '~types/network.interface';

import { buildDollarDisplayItem, buildPercentageDisplayItem } from '../presentation/display-item.present';
import { getTokenImg } from '../presentation/image.present';

export type SingleStakingFarmDefinition = {
  address: string;
  reserveAddress?: string;
  stakedTokenAddress: string;
  rewardTokenAddresses: string[];
};

export type SingleStakingFarmRois = {
  dailyROI: number;
  weeklyROI: number;
  yearlyROI: number;
};

export type SingleStakingFarmDataProps = {
  totalValueLocked: number;
  isActive: boolean;
  dailyROI: number;
  weeklyROI: number;
  yearlyROI: number;
  implementation?: string;
};

export type SingleStakingFarmResolveTotalValueLockedParams<T> = (opts: {
  contract: T;
  address: string;
  network: Network;
  stakedToken: WithMetaType<Token>;
  multicall: Multicall;
}) => Promise<BigNumberish>;

export type SingleStakingFarmResolveIsActiveParams<T> = (opts: {
  address: string;
  network: Network;
  contract: T;
  multicall: Multicall;
  stakedToken: WithMetaType<Token>;
  rewardTokens: WithMetaType<Token>[];
}) => boolean | Promise<boolean>;

export type SingleStakingFarmResolveRoisParams<T> = (opts: {
  address: string;
  network: Network;
  contract: T;
  multicall: Multicall;
  stakedToken: WithMetaType<Token>;
  rewardTokens: WithMetaType<Token>[];
  totalValueLocked: number;
}) => SingleStakingFarmRois | Promise<SingleStakingFarmRois>;

export type SingleStakingFarmContractPositionHelperParams<T> = {
  network: Network;
  appId: string;
  groupId: string;
  dependencies?: AppGroupsDefinition[];
  minimumTvl?: number;
  resolveFarmContract: (opts: { address: string; network: Network }) => T;
  resolveFarmDefinitions?: (opts: {
    network: Network;
  }) => SingleStakingFarmDefinition[] | Promise<SingleStakingFarmDefinition[]>;
  resolveImplementation?: () => string;
  resolveFarmAddresses?: (opts: { network: Network }) => string[] | Promise<string[]>;
  resolveStakedTokenAddress?: (opts: { contract: T; multicall: Multicall; index: number }) => Promise<string>;
  resolveRewardTokenAddresses?: (opts: { contract: T; multicall: Multicall }) => Promise<string | string[]>;
  resolveTotalValueLocked?: SingleStakingFarmResolveTotalValueLockedParams<T>;
  resolveIsActive?: SingleStakingFarmResolveIsActiveParams<T>;
  resolveRois: SingleStakingFarmResolveRoisParams<T>;
};

@Injectable()
export class SingleStakingFarmContractPositionHelper {
  constructor(@Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit) {}

  async getContractPositions<T>({
    network,
    appId,
    groupId,
    dependencies = [],
    minimumTvl = 0,
    resolveFarmContract,
    resolveFarmAddresses,
    resolveFarmDefinitions,
    resolveImplementation,
    resolveStakedTokenAddress = async () => '',
    resolveRewardTokenAddresses = async () => [],
    resolveIsActive = async () => true,
    resolveRois,
    resolveTotalValueLocked = this.defaultTotalValueLocked(),
  }: SingleStakingFarmContractPositionHelperParams<T>) {
    const multicall = this.appToolkit.getMulticall(network);

    const appTokens = await this.appToolkit.getAppTokenPositions(...dependencies);
    const baseTokens = await this.appToolkit.getBaseTokenPrices(network);
    const allTokens = [...appTokens, ...baseTokens];
    const farmDefinitionsOrAddresses = resolveFarmDefinitions
      ? await resolveFarmDefinitions({ network })
      : resolveFarmAddresses
      ? await resolveFarmAddresses({ network })
      : [];

    const contractPositions = await Promise.all(
      farmDefinitionsOrAddresses.map(
        async (definitionOrAddress: string | SingleStakingFarmDefinition, index: number) => {
          const type = ContractType.POSITION;
          const address = typeof definitionOrAddress === 'string' ? definitionOrAddress : definitionOrAddress.address;
          const contract = resolveFarmContract({ address, network });

          // Resolve staked token address
          const stakedTokenAddressRaw =
            typeof definitionOrAddress === 'string'
              ? await resolveStakedTokenAddress({ contract, multicall, index })
              : definitionOrAddress.stakedTokenAddress;
          const stakedTokenAddress = stakedTokenAddressRaw.toLowerCase();

          // Resolve reward token addresses
          const rewardTokenAddresses =
            typeof definitionOrAddress === 'string'
              ? await resolveRewardTokenAddresses({ contract, multicall }).then(v => (isArray(v) ? v : [v]))
              : definitionOrAddress.rewardTokenAddresses;

          // Resolve reserve address (where funds are locked)
          const reserveAddress =
            typeof definitionOrAddress === 'string'
              ? definitionOrAddress
              : definitionOrAddress.reserveAddress ?? definitionOrAddress.address;

          // Resolve tokens
          const depositTokenMatch = allTokens.find(v => v.address === stakedTokenAddress.toLowerCase());
          const maybeRewardTokens = rewardTokenAddresses.map(v => allTokens.find(t => t.address === v.toLowerCase()));
          if (!depositTokenMatch) return null;

          // Resolve as much as we can about this token from on-chain data
          const rewardTokenMatches = await Promise.all(
            maybeRewardTokens.map(async (maybeRewardToken, i) => {
              if (maybeRewardToken) return maybeRewardToken;

              const address = rewardTokenAddresses[i];
              const contract = this.appToolkit.globalContracts.erc20({ address, network });
              const [symbol, decimals] = await Promise.all([
                multicall.wrap(contract).symbol(),
                multicall.wrap(contract).decimals(),
              ]);

              const token: BaseToken = { type: ContractType.BASE_TOKEN, address, network, symbol, decimals, price: 0 };
              return token;
            }),
          );

          const stakedToken = supplied(depositTokenMatch);
          const rewardTokens = rewardTokenMatches.map(rewardToken => claimable(rewardToken));
          const tokens = [stakedToken, ...rewardTokens];

          // Resolve data props
          const totalValueLockedRaw = await resolveTotalValueLocked({
            address: reserveAddress,
            network,
            contract,
            multicall,
            stakedToken,
          });

          const totalValueLocked = stakedToken.price * (Number(totalValueLockedRaw) / 10 ** stakedToken.decimals);
          const isActive = await resolveIsActive({ address, network, contract, multicall, stakedToken, rewardTokens });

          const rois = await resolveRois({
            address,
            network,
            contract,
            multicall,
            stakedToken,
            rewardTokens: rewardTokenMatches,
            totalValueLocked,
          });

          const otherProps = resolveImplementation ? { implementation: resolveImplementation() } : {};
          const dataProps = { totalValueLocked, isActive, ...rois, ...otherProps };

          // Display Properties
          const underlyingLabel =
            stakedToken.type === ContractType.APP_TOKEN ? stakedToken.displayProps.label : stakedToken.symbol;
          const label = `Staked ${underlyingLabel}`;
          const secondaryLabel = buildDollarDisplayItem(stakedToken.price);
          const images = [getTokenImg(stakedToken.address, network)];
          const statsItems = [
            { label: 'ROI', value: buildPercentageDisplayItem(rois.yearlyROI) },
            { label: 'TVL', value: buildDollarDisplayItem(totalValueLocked) },
          ];
          const displayProps = { label, secondaryLabel, images, statsItems };

          const contractPosition: ContractPosition<SingleStakingFarmDataProps> = {
            type,
            address,
            network,
            appId,
            groupId,
            tokens,
            dataProps,
            displayProps,
          };

          return contractPosition;
        },
      ),
    );

    return compact(contractPositions).filter(v => v.dataProps.totalValueLocked >= minimumTvl);
  }

  defaultTotalValueLocked<T>(): SingleStakingFarmResolveTotalValueLockedParams<T> {
    return ({ stakedToken, network, address, multicall }) => {
      return stakedToken.address === ZERO_ADDRESS
        ? multicall.wrap(multicall.contract).getEthBalance(address)
        : multicall
            .wrap(this.appToolkit.globalContracts.erc20({ address: stakedToken.address, network }))
            .balanceOf(address);
    };
  }
}
