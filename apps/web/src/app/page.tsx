import Image from 'next/image'

export default function Home() {
  return (
    <div className='grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-sans sm:p-20'>
      <main className='row-start-2 flex flex-col items-center gap-[32px] sm:items-start'>
        <div className='text-center sm:text-left'>
          <h1 className='text-foreground mb-4 text-4xl font-bold'>
            Grab Some APIs 🚀
          </h1>
          <p className='text-muted-foreground text-lg'>
            Your ultimate API exploration dashboard
          </p>
        </div>

        <ol className='list-inside list-decimal text-center font-mono text-sm/6 sm:text-left'>
          <li className='mb-2 tracking-[-.01em]'>
            Get started by editing{' '}
            <code className='rounded bg-black/[.05] px-1 py-0.5 font-mono font-semibold dark:bg-white/[.06]'>
              src/app/page.tsx
            </code>
            .
          </li>
          <li className='tracking-[-.01em]'>
            Build your API dashboard and explore public APIs.
          </li>
        </ol>

        <div className='flex flex-col items-center gap-4 sm:flex-row'>
          <a
            className='bg-foreground text-background flex h-10 items-center justify-center gap-2 rounded-full border border-solid border-transparent px-4 text-sm font-medium transition-colors hover:bg-[#383838] sm:h-12 sm:w-auto sm:px-5 sm:text-base dark:hover:bg-[#ccc]'
            href='/nasa'
            rel='noopener noreferrer'
          >
            🚀 Explore NASA APOD
          </a>
          <a
            className='bg-foreground text-background flex h-10 items-center justify-center gap-2 rounded-full border border-solid border-transparent px-4 text-sm font-medium transition-colors hover:bg-[#383838] sm:h-12 sm:w-auto sm:px-5 sm:text-base dark:hover:bg-[#ccc]'
            href='/api/health'
            rel='noopener noreferrer'
          >
            Test API
          </a>
          <a
            className='flex h-10 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-4 text-sm font-medium transition-colors hover:border-transparent hover:bg-[#f2f2f2] sm:h-12 sm:w-auto sm:px-5 sm:text-base md:w-[158px] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]'
            href='https://nextjs.org/docs'
            target='_blank'
            rel='noopener noreferrer'
          >
            Next.js Docs
          </a>
        </div>
      </main>
      <footer className='row-start-3 flex flex-wrap items-center justify-center gap-[24px]'>
        <a
          className='flex items-center gap-2 hover:underline hover:underline-offset-4'
          href='https://github.com/SSlimShady/grab-some-apis'
          target='_blank'
          rel='noopener noreferrer'
        >
          <Image
            aria-hidden
            src='/file.svg'
            alt='File icon'
            width={16}
            height={16}
          />
          View Source
        </a>
        <a
          className='flex items-center gap-2 hover:underline hover:underline-offset-4'
          href='/nasa'
          rel='noopener noreferrer'
        >
          <span className='text-lg'>🚀</span>
          NASA APOD
        </a>
        <a
          className='flex items-center gap-2 hover:underline hover:underline-offset-4'
          href='/dashboard'
          rel='noopener noreferrer'
        >
          <Image
            aria-hidden
            src='/window.svg'
            alt='Window icon'
            width={16}
            height={16}
          />
          Dashboard
        </a>
        <a
          className='flex items-center gap-2 hover:underline hover:underline-offset-4'
          href='/apis'
          rel='noopener noreferrer'
        >
          <Image
            aria-hidden
            src='/globe.svg'
            alt='Globe icon'
            width={16}
            height={16}
          />
          Explore APIs
        </a>
      </footer>
    </div>
  )
}
