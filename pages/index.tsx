import type { NextPage } from 'next';
import Head from 'next/head';
import { useContext, useState } from 'react';
import TransactionCard from '../components/TransactionCard';
import { ApiContext, apiContextType } from '../context';

const Home: NextPage = () => {
  const { daiTransferEvents, setDaiTransferEvents } = useContext<apiContextType>(ApiContext);
  const [senderFilter, setSenderFilter] = useState('');
  const [recipientFilter, setRecipientFilter] = useState('');

  const sortByTimestamp = (direction: number) => {
    const newState = [...daiTransferEvents.sort((a, b) => (a.timestamp > b.timestamp ? direction : direction * -1))];
    setDaiTransferEvents(newState);
  };

  const sortByValue = (direction: number) => {
    const newState = [
      ...daiTransferEvents.sort((a, b) => (parseFloat(a.value) > parseFloat(b.value) ? direction : direction * -1)),
    ];
    setDaiTransferEvents(newState);
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen py-2'>
      <Head>
        <title>Fractional Dashboard</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className='flex flex-col items-center justify-center flex-1 w-full px-4 text-center md:px-20'>
        <p className='flex justify-center text-2xl'>Latest DAI token transfer events</p>
        {daiTransferEvents.length <= 0 ? (
          <p>Loading events... </p>
        ) : (
          <>
            <div className='flex flex-col justify-between pt-12 md:flex-row gap-y-4 md:gap-x-10'>
              <div className='flex flex-col'>
                <p>Filter the list by sender:</p>
                <input type='text' value={senderFilter} onChange={(event) => setSenderFilter(event.target.value)} />
              </div>
              <div className='flex flex-col'>
                <p>Filter the list by recipient:</p>
                <input
                  type='text'
                  value={recipientFilter}
                  onChange={(event) => setRecipientFilter(event.target.value)}
                />
              </div>
            </div>
            <div className='flex flex-col justify-between pt-12 md:flex-row gap-y-4 md:gap-x-10'>
              <div className='flex justify-between gap-4'>
                <button className='p-4 border border-gray-400 rounded-full' onClick={() => sortByTimestamp(1)}>
                  Sort by timestamp Asc
                </button>
                <button className='p-4 border border-gray-400 rounded-full' onClick={() => sortByTimestamp(-1)}>
                  Sort by timestamp Desc
                </button>
              </div>

              <div className='flex justify-between gap-4'>
                <button className='p-4 border border-gray-400 rounded-full' onClick={() => sortByValue(1)}>
                  Sort by value Asc
                </button>
                <button className='p-4 border border-gray-400 rounded-full' onClick={() => sortByValue(-1)}>
                  Sort by value Desc
                </button>
              </div>
            </div>
            <div className='grid grid-cols-1 pt-24 gap-y-12 gap-x-12 sm:grid-cols-2 lg:grid-cols-3'>
              {daiTransferEvents
                .filter((ev) => ev.sender.includes(senderFilter) || senderFilter === '')
                .filter((ev) => ev.recipient.includes(recipientFilter) || recipientFilter === '')
                .map((tran, index) => (
                  <TransactionCard
                    key={index}
                    index={index}
                    transactionHash={tran.transactionHash}
                    timestamp={tran.timestamp}
                    sender={tran.sender}
                    recipient={tran.recipient}
                    value={tran.value}
                  />
                ))}
            </div>
          </>
        )}
      </main>

      <footer className='flex items-center justify-center w-full h-24 border-t'>
        <p className='items-center justify-center gap-2 lex'>
          Created by{' '}
          <a
            className='text-blue-600'
            href='https://www.linkedin.com/in/nikolaos-stanogias-7a359a50/'
            target='_blank'
            rel='noopener noreferrer'
          >
            nstanogias
          </a>
        </p>
      </footer>
    </div>
  );
};

export default Home;
