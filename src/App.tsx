import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import MainArea from './components/MainArea';
import AutoScroll from './components/AutoScroll';

const DragAndDropList: React.FC = () => {

  return (
    <>
      <div className="flex">
        <Sidebar />
        <AutoScroll />
      </div>
    </>
  );
};

export default DragAndDropList;