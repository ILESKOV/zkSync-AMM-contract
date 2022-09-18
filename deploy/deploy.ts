import { Wallet, Provider, utils } from "zksync-web3";
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
require("dotenv").config();
const { PRIVATE_KEY } = process.env;

// An example of a deploy script that will deploy and call a simple contract.
export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Running deploy script for the CPAMM contract`);

  // Initialize the wallet.
  const provider = new Provider(hre.userConfig.zkSyncDeploy?.zkSyncNetwork);
  const wallet = new Wallet(PRIVATE_KEY);

  // Create deployer object and load the artifact of the contract you want to deploy.
  const deployer = new Deployer(hre, wallet);
  const token0_artifact = await deployer.loadArtifact("token0");
  const token1_artifact = await deployer.loadArtifact("token1");
  const CPAMM_artifact = await deployer.loadArtifact("CPAMM");

  // Estimate contract deployment fee
  const token0_simulation = "0x739712f6be312dafd8b71a1d33e30c5ed69514e2";
  const token1_simulation = "0xf8dff94dacd3b136ef097ebaae5f6c064a2dbc42";
  const deploymentFee = await deployer.estimateDeployFee(CPAMM_artifact, [
    token0_simulation,
    token1_simulation,
  ]);

  // Deposit funds to L2
  const depositHandle = await deployer.zkWallet.deposit({
    to: deployer.zkWallet.address,
    token: utils.ETH_ADDRESS,
    amount: deploymentFee.mul(3),
  });
  // Wait until the deposit is processed on zkSync
  await depositHandle.wait();

  // Deploy this contract. The returned object will be of a `Contract` type, similarly to ones in `ethers`.
  // `token0.address` and `token1.address` are an arguments for contract constructor.
  const parsedFee = ethers.utils.formatEther(deploymentFee.toString());
  console.log(`The deployment is estimated to cost ${parsedFee} ETH`);

  const token0 = await deployer.deploy(token0_artifact);
  const token1 = await deployer.deploy(token1_artifact);
  const CPAMM_contract = await deployer.deploy(CPAMM_artifact, [
    token0.address,
    token1.address,
  ]);

  //obtain the Constructor Arguments
  console.log(
    "constructor args:" +
      CPAMM_contract.interface.encodeDeploy([token0.address, token1.address])
  );

  // Show the contract info.
  const contractAddress = CPAMM_contract.address;
  console.log(
    `${CPAMM_artifact.contractName} was deployed to ${contractAddress}`
  );
}
