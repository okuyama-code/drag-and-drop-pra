const Sidebar = () => {
  return (
    <div className='min-w-[200px] text-center bg-blue-200 h-screen mr-4 flex flex-col'>
      <h2 className='mt-10 mb-20 text-xl'>システム名称</h2>
      <div className='flex-grow flex flex-col justify-between'>
        <div>
          <ul>
            <li className='mb-3'>ツアー一覧</li>
            <li>運航取り込み処理</li>
          </ul>
        </div>
        <div className='mb-5'>
          <p>ログアウト</p>
        </div>
      </div>
    </div>
  )
}

export default Sidebar