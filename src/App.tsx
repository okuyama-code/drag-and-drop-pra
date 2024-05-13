import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import MainArea from './components/MainArea';




const DragAndDropList: React.FC = () => {

  return (
    <>
      <div className="flex">
        <Sidebar />
        <MainArea />
      </div>
    </>
  );
};

export default DragAndDropList;