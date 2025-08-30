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

        <div className='flex flex-col items-center gap-4 sm:flex-row'>
          <a
            className='bg-foreground text-background flex h-10 items-center justify-center gap-2 rounded-full border border-solid border-transparent px-4 text-sm font-medium transition-colors hover:bg-[#383838] sm:h-12 sm:w-auto sm:px-5 sm:text-base dark:hover:bg-[#ccc]'
            href='/nasa'
            rel='noopener noreferrer'
          >
            Explore NASA APOD
          </a>
          <a
            className='bg-foreground text-background flex h-10 items-center justify-center gap-2 rounded-full border border-solid border-transparent px-4 text-sm font-medium transition-colors hover:bg-[#383838] sm:h-12 sm:w-auto sm:px-5 sm:text-base dark:hover:bg-[#ccc]'
            href='/giphy'
            rel='noopener noreferrer'
          >
            Explore GIPHY
          </a>
          <a
            className='flex h-10 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-4 text-sm font-medium transition-colors hover:border-transparent hover:bg-[#f2f2f2] sm:h-12 sm:w-auto sm:px-5 sm:text-base md:w-[158px] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]'
            href='https://github.com/SSlimShady/grab-some-apis/blob/main/README.md'
            target='_blank'
            rel='noopener noreferrer'
          >
            README
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
      </footer>
    </div>
  )
}
