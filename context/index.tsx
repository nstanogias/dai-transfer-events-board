import { createContext, ReactNode, useEffect, useState } from 'react';
import moment from 'moment';
import { ethers } from 'ethers';
import Dai from '../contracts/Dai.js';

export interface Transaction {
  transactionHash: string;
  timestamp: string;
  value: string;
  sender: string;
  recipient: string;
}

export type apiContextType = {
  daiTransferEvents: Transaction[];
  setDaiTransferEvents: (daiTransferEvents: Transaction[]) => void;
};

const apiContextDefaultValues: apiContextType = {
  daiTransferEvents: [],
  setDaiTransferEvents: (daiTransferEvents: Transaction[]) => {},
};

export const ApiContext = createContext<apiContextType>(apiContextDefaultValues);

type Props = {
  children: ReactNode;
};

const ApiProvider = ({ children }: Props) => {
  const [daiTransferEvents, setDaiTransferEvents] = useState<Transaction[]>([]);
  const provider = new ethers.providers.JsonRpcProvider(
    `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`
  );
  const daiContractAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const transferTopicHash = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

  const contract = new ethers.Contract(daiContractAddress, Dai.abi, provider);

  useEffect(() => {
    const fetchContractData = async () => {
      try {
        const transferEvents = await contract.queryFilter('Transfer', -100);
        // console.log(transferEvents);
        const daiTransferLogEvents = await Promise.all(
          transferEvents.map(async (transfer) => {
            let block = await transfer.getBlock();
            let receipt = await transfer.getTransactionReceipt();
            let transactionLogs = receipt.logs;
            let daiTransferEventLogs = transactionLogs
              .filter((tLog) => tLog.address === daiContractAddress)
              .filter((tLog) => tLog.topics[0] === transferTopicHash);
            return daiTransferEventLogs.map((log) => {
              return {
                timestamp: moment(new Date(block.timestamp * 1000)).format('MMMM Do YYYY, h:mm:ss a'),
                daiTransferLog: log,
                transactionHash: receipt.transactionHash,
              };
            });
          })
        );

        // daiTransferLogEvents contains duplicated events
        // console.log(daiTransferLogEvents);
        const uniqueEventsObj = daiTransferLogEvents
          .flatMap((val) => val)
          .reduce((acc, curr) => {
            const key = curr.daiTransferLog.logIndex.toString() + curr.transactionHash; //this combination should be unique
            if (!acc[key]) {
              acc[key] = {
                timestamp: curr.timestamp,
                transactionHash: curr.transactionHash,
                sender: curr.daiTransferLog.topics[1],
                recipient: curr.daiTransferLog.topics[2],
                value: ethers.utils.formatUnits(
                  ethers.utils.defaultAbiCoder.decode(['uint256'], curr.daiTransferLog.data)[0].toString(),
                  18
                ),
              };
            }
            return acc;
          }, {});

        setDaiTransferEvents(
          Object.keys(uniqueEventsObj)
            .slice(-100)
            .sort((a, b) => (uniqueEventsObj[a].timestamp > uniqueEventsObj[b].timestamp ? -1 : 1))
            .map((txHash) => {
              return {
                transactionHash: uniqueEventsObj[txHash].transactionHash,
                timestamp: uniqueEventsObj[txHash].timestamp,
                sender: uniqueEventsObj[txHash].sender,
                recipient: uniqueEventsObj[txHash].recipient,
                value: uniqueEventsObj[txHash].value,
              };
            })
        );
      } catch (err: any) {
        console.log(err.message);
      }
    };
    fetchContractData();

    contract.on('Transfer', (from, to, amount, event) => {
      // console.log(event);
      setDaiTransferEvents((prev) => {
        const newDaiTransferEvents = [
          {
            transactionHash: event.transactionHash,
            timestamp: moment(new Date()).format('MMMM Do YYYY, h:mm:ss a'),
            sender: from,
            recipient: to,
            value: ethers.utils.formatUnits(amount, 18),
          },
          ...prev,
        ];
        return newDaiTransferEvents.slice(0, 100);
      });
    });

    return () => {
      contract.removeAllListeners('Transfer');
    };
  }, []);

  const value = {
    daiTransferEvents,
    setDaiTransferEvents,
  };

  return (
    <>
      <ApiContext.Provider value={value}>{children}</ApiContext.Provider>
    </>
  );
};

export default ApiProvider;
