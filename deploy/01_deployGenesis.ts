import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Deployment } from "hardhat-deploy/dist/types";
import { networkConfig } from "../helper-hardhat-config";
import "hardhat-ethernal";

const deployRaffle: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment,
) {
  const { deployments, getNamedAccounts, getChainId } = hre;
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();
  let linkTokenAddress: string,
    vrfCoordinatorAddress: string,
    linkToken: Deployment,
    VRFCoordinatorMock: Deployment;
  let additionalMessage = "";

  if (chainId === "31337") {
    linkToken = await get("LinkToken");
    VRFCoordinatorMock = await get("VRFCoordinatorMock");
    linkTokenAddress = linkToken.address;
    vrfCoordinatorAddress = VRFCoordinatorMock.address;
    additionalMessage = " --linkaddress " + linkTokenAddress;
  } else {
    linkTokenAddress = networkConfig[chainId].linkToken!;
    vrfCoordinatorAddress = networkConfig[chainId].vrfCoordinator!;
  }
  const keyHash: string = networkConfig[chainId].keyHash;

  const genesis = await deploy("Genesis", {
    from: deployer,
    args: [
      vrfCoordinatorAddress,
      linkTokenAddress,
      keyHash,
      "ipfs://QmUygfragP8UmCa7aq19AHLttxiLw1ELnqcsQQpM5crgTF/",
    ],
    log: true,
  });
  await hre.ethernal.push({
    name: "Genesis",
    address: genesis.address,
  });
  const networkWorkName: string = networkConfig[chainId].name;

  log("Run the following command to fund contract with LINK:");
  log(
    "npx hardhat fund-link --contract " +
      genesis.address +
      " --network " +
      networkWorkName +
      additionalMessage,
  );
};
export default deployRaffle;
deployRaffle.tags = ["all", "raffle"];
