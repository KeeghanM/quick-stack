const homeString = `
export default function Home() {
  return (
    <>
      <div className='navbar bg-base-100'>
        <div className='flex-1'>
          <a className='btn btn-ghost text-xl'>{{ NAME }}</a>
        </div>
        <div className='flex-none'>
          <button className='btn btn-square btn-ghost'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              className='inline-block w-5 h-5 stroke-current'
            >
              <path
                stroke-linecap='round'
                stroke-linejoin='round'
                stroke-width='2'
                d='M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z'
              ></path>
            </svg>
          </button>
        </div>
      </div>
      <div className='hero min-h-screen bg-base-200'>
        <div className='hero-content text-center'>
          <div className='max-w-md'>
            <h1 className='text-5xl font-bold'>{{ NAME }}</h1>
            <p className='py-6'>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed neque
              elit, tristique placerat feugiat ac, facilisis vitae arcu. Proin
              eget egestas augue. Praesent ut sem nec arcu pellentesque aliquet.
              Duis dapibus diam vel metus tempus, ac suscipit ipsum gravida.
              Donec et turpis ligula.
            </p>
            <button className='btn btn-primary'>Get Started</button>
          </div>
        </div>
      </div>
    </>
  )
}`

export default homeString
