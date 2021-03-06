import { ethers } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { networkConfig } from '../helper-hardhat-config';

const deployGenesis: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment,
) {
  const { deployments, getNamedAccounts, getChainId } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  const mintPrice: string = networkConfig[chainId].mintPrice;
  const unrevealedURI: string = networkConfig[chainId].unrevealedURI;
  const openSeaProxyAddress: string =
    networkConfig[chainId].openSeaProxyAddress;

  // Test network deployment only
  if (chainId === '31337') {
    console.log(`Deploying GenesisSupply on ${chainId}`);
    const genesisSupply = await deploy('GenesisSupply', {
      from: deployer,
      log: true,
    });
    console.log(
      `Deploying Genesis on ${chainId} with supply address ${genesisSupply.address}`,
    );
    const genesis = await deploy('Genesis', {
      from: deployer,
      args: [
        genesisSupply.address,
        unrevealedURI,
        mintPrice,
        openSeaProxyAddress,
      ],
      log: true,
    });

    await hre.ethernal.push({
      name: 'GenesisSupply',
      address: genesisSupply.address,
    });
    await hre.ethernal.push({
      name: 'Genesis',
      address: genesis.address,
    });

    // Live networks
  } else {
    console.log(`Live network deploying GenesisSupply on ${chainId}`);
    const genesisSupply = await deploy('GenesisSupply', {
      from: deployer,
      args: [],
      log: true,
    });
    console.log(`Live network deploying Genesis on ${chainId}`);
    await deploy('Genesis', {
      from: deployer,
      args: [
        genesisSupply.address,
        unrevealedURI,
        mintPrice,
        openSeaProxyAddress,
      ],
      log: true,
    });
  }
};

export default deployGenesis;
deployGenesis.tags = ['all', 'genesis'];
