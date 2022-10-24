import Link from 'next/link';
import { FC } from 'react';
import { Transaction } from '../context';

interface Props extends Transaction {
  index: number;
}

const TransactionCard: FC<Props> = ({ index, timestamp, value, sender, recipient, transactionHash }) => {
  return (
    <div className='flex flex-col w-full break-all bg-white rounded-xl hover:shadow-xl'>
      <div className='flex px-6 pt-6 pb-3 border-b-2 border-gray-200'>
        <p className='break-normal'>{index + 1}.</p>
        <Link href={`https://etherscan.io/tx/${transactionHash}`} className='pl-4 font-semibold cursor-pointer'>
          <a className='pl-4 font-semibold cursor-pointer' target='_blank'>
            {transactionHash}
          </a>
        </Link>
      </div>
      <div className='flex flex-col items-start px-6 pt-4'>
        <p>Timestamp: {timestamp}</p>
        <p className='pt-2'>Sender: {sender}</p>
        <p className='pt-2'>Recipient: {recipient}</p>
        <p className='pt-2'>Value: {value}</p>
      </div>
    </div>
  );
};

export default TransactionCard;
