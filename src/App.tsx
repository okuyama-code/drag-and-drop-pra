import React, { useState } from 'react';

interface OperationData {
  id: number;
  startTime: Date;
  endTime: Date;
}

interface Tour {
  id: number;
  date: Date;
  operations: OperationData[];
}

const initialOperationData: OperationData[] = [
  { id: 1,  startTime: new Date('2024-04-19T04:00:00Z'), endTime: new Date('2024-04-19T10:00:00Z') },
  { id: 2,  startTime: new Date('2024-04-19T03:00:00Z'), endTime: new Date('2024-04-19T13:00:00Z') },
  { id: 3, startTime: new Date('2024-04-19T01:00:00Z'), endTime: new Date('2024-04-19T05:00:00Z') },
  { id: 4, startTime: new Date('2024-04-19T01:30:00Z'), endTime: new Date('2024-04-19T03:00:00Z') },
  { id: 5, startTime: new Date('2024-04-19T06:00:00Z'), endTime: new Date('2024-04-19T09:00:00Z') },
];

const initialTours: Tour[] = [
  { id: 1, date: new Date('2024-04-19'), operations: [initialOperationData[0]] },
  { id: 2, date: new Date('2024-04-19'), operations: [initialOperationData[1]] },
  { id: 3, date: new Date('2024-04-19'), operations: [initialOperationData[2]] },
  { id: 4, date: new Date('2024-04-19'), operations: [initialOperationData[3]] },
  { id: 5, date: new Date('2024-04-19'), operations: [initialOperationData[4]] },
];

const DragAndDropList: React.FC = () => {
  const [tours, setTours] = useState<Tour[]>(initialTours);

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, id: number, dragPosition: 'start' | 'end' | 'middle') => {
    event.dataTransfer.setData('operationId', id.toString());
    event.dataTransfer.setData('dragPosition', dragPosition);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, tourId: number, tourDate: Date) => {
    event.preventDefault();
    const operationId = Number(event.dataTransfer.getData('operationId'));

    // ドラッグ位置（開始、終了、中間）を取得します。
    const dragPosition = event.dataTransfer.getData('dragPosition') as 'start' | 'end' | 'middle';

    // ツアー配列内で、指定されたツアーIDに一致するツアーのインデックスを取得します。
    const tourIndex = tours.findIndex(t => t.id === tourId);
    // ツアーが見つからない場合は、関数を終了します。
    if (tourIndex === -1) return;

    // 指定されたツアー内の操作配列で、指定された操作IDに一致する操作のインデックスを取得します。
    const operationIndex = tours[tourIndex].operations.findIndex(op => op.id === operationId);
    // 操作が見つからない場合は、関数を終了します。
    if (operationIndex === -1) return;

    // ツアー配列のコピーを作成します。
    const updatedTours = [...tours];
    // 移動する操作を取得します。
    const movedOperation = updatedTours[tourIndex].operations[operationIndex];

    // ドロップ先の要素の位置とサイズを取得します。
    const dropTarget = event.currentTarget.getBoundingClientRect();

    // ドロップ位置のX座標から、ドロップ先の要素内での開始時間の割合を計算します。0 ~ 100までの値が横軸で表示される
    const startTimePercentage = ((event.clientX - dropTarget.left) / dropTarget.width) * 100;

    // 開始時間の割合から、分単位の開始時間を計算します（15分刻み）。
    const startMinutes = Math.round((startTimePercentage / 100) * 24 * 60 / 15) * 15;

    // 開始時間の時間部分を計算します。
    const startHour = Math.floor(startMinutes / 60);

    // 開始時間の分部分を計算します。
    const startMinute = startMinutes % 60;


    console.log('event.clientX')
    console.log(event.clientX)
    console.log('dropTarget')
    console.log(dropTarget)
    console.log('startTimePercentage')
    console.log(startTimePercentage)
    console.log('startMinutes')
    console.log(startMinutes)
    console.log('startHour')
    console.log(startHour)
    console.log('startMinute')
    console.log(startMinute)

    // 移動された操作の更新後のデータを格納するための変数を定義します。
    let updatedOperation: OperationData = { ...movedOperation };

    // ドラッグ位置が開始位置の場合の処理
    if (dragPosition === 'start') {
      // 新しい開始時間を計算します。
      const newStartTime = new Date(tourDate.getFullYear(), tourDate.getMonth(), tourDate.getDate(), startHour, startMinute);
      // 新しい開始時間が終了時間より前の場合のみ、開始時間を更新します。
      if (newStartTime < updatedOperation.endTime) {
        updatedOperation.startTime = newStartTime;
      }
    }

    // ドラッグ位置が終了位置の場合の処理
    if (dragPosition === 'end') {
      // 新しい終了時間を計算します。
      const newEndTime = new Date(tourDate.getFullYear(), tourDate.getMonth(), tourDate.getDate(), startHour, startMinute);
      // 新しい終了時間が開始時間より後の場合のみ、終了時間を更新します。
      if (newEndTime > updatedOperation.startTime) {
        updatedOperation.endTime = newEndTime;
      }
    }

    // ドラッグ位置が中間の場合の処理
    if (dragPosition === 'middle') {
      // 操作の期間（ミリ秒）を計算します。
      const operationDuration = movedOperation.endTime.getTime() - movedOperation.startTime.getTime();
      // 新しい開始時間を設定します。
      updatedOperation.startTime = new Date(tourDate.getFullYear(), tourDate.getMonth(), tourDate.getDate(), startHour, startMinute);
      // 新しい終了時間を、開始時間に期間を加えて計算します（15分刻み）。
      updatedOperation.endTime = new Date(tourDate.getFullYear(), tourDate.getMonth(), tourDate.getDate(), startHour, startMinute + Math.floor(operationDuration / 60000 / 15) * 15);
    }

    // 更新後のツアーデータに、更新された操作データを設定します。
    updatedTours[tourIndex].operations[operationIndex] = updatedOperation;
    // ツアーデータの状態を更新します。
    setTours(updatedTours);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };


  const renderTimeBlocks = () => {
    const timeBlocks = []
    const totalHours = 48
    const blockWidth = 50

    for (let i = 0; i < totalHours; i++) {
      const hour = i % 24

      timeBlocks.push(
        <div
          key={i}
          style={{
            width: blockWidth,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '14px',
            position: 'relative'
          }}
        >
          {`${hour}:00`}
        </div>
      )
    }

    return (
      <div
        className="flex-grow relative h-[75px] flex overflow-x-auto ml-[1px]"
        style={{ width: `${blockWidth * totalHours}px` }}
      >
        <div className="flex mt-4">{timeBlocks}</div>
        <div
          style={{
            position: 'absolute',
            bottom: 45,
            width: '1210px',
            height: '30px',
            display: 'flex',
            alignItems: 'center'
          }}
          className="bg-gradient-to-r from-sidebar-start via-sidebar-middle to-sidebar-end  pl-1 font-bold"
        >
          2024-04-19
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 45,
            left: 1210,
            width: '1190px',
            height: '30px',
            display: 'flex',
            alignItems: 'center'
          }}
          className="bg-gradient-to-r from-sidebar-start via-sidebar-middle to-sidebar-end pl-1 font-bold"
        >
          2024-04-20
        </div>
      </div>
    )
  }

   return (
    <>
      <div style={{ display: 'flex' }}>

        <div style={{ display: 'flex', flexDirection: 'column', marginRight: '10px', borderBottom: '1px solid #ccc' }}>

        </div>

        <div style={{ flexGrow: 1 }}>
          <div style={{ position: 'relative', height: '50px', display: 'flex', alignItems: 'center' }}>
            {renderTimeBlocks()}
          </div>
          {tours.map(tour => (
            <div key={tour.id} style={{ marginBottom: '20px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <h3>Tour {tour.id}</h3>
              </div>
              <div
                onDrop={e => handleDrop(e, tour.id, tour.date)}
                onDragOver={handleDragOver}
                style={{
                  position: 'relative',
                  height: '100px',
                  border: '2px dashed #ccc',
                  borderRadius: '5px',
                  marginTop: '10px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#f8f9fa',
                }}
              >
                {
                  tour.operations.map(operation => {
                    const operationStartTimePercentage = (operation.startTime.getHours() * 60 + operation.startTime.getMinutes()) / (24 * 60) * 100;
                    const operationEndTimePercentage = (operation.endTime.getHours() * 60 + operation.endTime.getMinutes()) / (24 * 60) * 100;
                    const operationWidthPercentage = operationEndTimePercentage - operationStartTimePercentage;

                    return (
                      <div
                        key={operation.id}
                        style={{
                          position: 'absolute',
                          left: `${operationStartTimePercentage}%`,
                          width: `${operationWidthPercentage}%`,
                          background: '#007bff',
                          color: '#fff',
                          padding: '10px',
                          borderRadius: '5px',
                          boxShadow: '0 0 3px rgba(0,0,0,0.3)',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: '100%',
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            left: '-5px',
                            width: '10px',
                            height: '100%',
                            background: 'rgba(255, 255, 255, 0.5)',
                            cursor: 'ew-resize',
                            zIndex: 1,
                          }}
                          draggable
                          onDragStart={e => handleDragStart(e, operation.id, 'start')}
                        />
                        <div
                          style={{ flexGrow: 1, cursor: 'move' ,height: '100%',
                        }}
                          draggable
                          onDragStart={e => handleDragStart(e, operation.id, 'middle')}
                        >
                          {`${operation.startTime.toLocaleTimeString()} - ${operation.endTime.toLocaleTimeString()}`}
                        </div>
                        <div
                          style={{
                            position: 'absolute',
                            right: '-5px',
                            width: '10px',
                            height: '100%',
                            background: 'rgba(255, 255, 255, 0.5)',
                            cursor: 'ew-resize',
                            zIndex: 1,
                          }}
                          draggable
                          onDragStart={e => handleDragStart(e, operation.id, 'end')}
                        />
                      </div>
                    );
                  })
                }
              </div>
            </div>
          ))}
        </div>

      </div>
    </>
  );
};

export default DragAndDropList;
