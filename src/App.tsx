import React, { useState } from 'react';

interface OperationData {
  id: number;
  startTime: Date;
  endTime: Date;
}

interface Tour {
  id: number;
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
  { id: 1, operations: [initialOperationData[0]] },
  { id: 2, operations: [initialOperationData[1]] },
  { id: 3, operations: [initialOperationData[2]] },
  { id: 4, operations: [initialOperationData[3]] },
  { id: 5, operations: [initialOperationData[4]] },
];

const DragAndDropList: React.FC = () => {
  const [tours, setTours] = useState<Tour[]>(initialTours);
  const [beginDate,] = useState<Date>(new Date('2024-04-18T15:00:00Z'))

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, id: number, dragPosition: 'start' | 'end' | 'middle') => {
    event.dataTransfer.setData('operationId', id.toString());
    event.dataTransfer.setData('dragPosition', dragPosition);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, tourId: number) => {
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

    // 移動する操作を取得します。
    const movedOperation = tours[tourIndex].operations[operationIndex];

      // イベントが発生した要素の寸法と位置を取得
    const containerRect = event.currentTarget.getBoundingClientRect();

    // 要素の左端の位置を計算（スクロール量を考慮）
    // window.scrollX は現在の水平スクロール量を表す
    const containerLeft = containerRect.left + window.scrollX;

    // マウスのドロップ位置（X座標）から要素の左端の位置を引いて、要素内での相対的なドロップ位置を計算
    const dropX = event.pageX - containerLeft;

    // 要素の幅を取得
    const containerWidth = containerRect.width;

    // 48時間をミリ秒に変換（1日 = 24時間, 1時間 = 60分, 1分 = 60秒, 1秒 = 1000ミリ秒）
    const dayDurationMs = 48 * 60 * 60 * 1000;

    // ドロップ位置を時間に変換（15分刻み）
    // dropX / containerWidth で要素内の相対的なドロップ位置を0から1の範囲で表す
    // それに dayDurationMs を掛けることで、48時間内での相対的な時間を計算
    // 計算結果を 15分（900,000ミリ秒）で割って切り捨て、再び掛けることで、15分刻みの時間に変換
    const startTimeMs =
      Math.round(
        ((dropX / containerWidth) * dayDurationMs) / (15 * 60 * 1000)
      ) *
      (15 * 60 * 1000);

    // 開始日時（beginDate）のミリ秒表現に、計算したドロップ位置の時間を加算して、新しい開始時間を計算
    const newStartTime = new Date(beginDate.getTime() + startTimeMs);

    console.log('containerRect')
    console.log(containerRect)
    console.log('containerLeft')
    console.log(containerLeft)
    console.log('window.scrollX')
    console.log(window.scrollX)
    console.log('dropX')
    console.log(dropX)
    console.log('containerWidth')
    console.log(containerWidth)
    console.log('dayDurationMs')
    console.log(dayDurationMs)
    console.log('startTimeMs')
    console.log(startTimeMs)
    console.log('newStartTime')
    console.log(newStartTime)

    // 移動された操作の更新後のデータを格納するための変数を定義します。
    let updatedOperation: OperationData = { ...movedOperation };

    // ドラッグ位置が開始位置の場合の処理
    if (dragPosition === 'start') {
      // 新しい開始時間が終了時間より前の場合のみ、開始時間を更新します。
      if (newStartTime < updatedOperation.endTime) {
        updatedOperation.startTime = newStartTime;
      }
    }

    // ドラッグ位置が終了位置の場合の処理
    if (dragPosition === 'end') {
      // 新しい終了時間が開始時間より後の場合のみ、終了時間を更新します。
      if (newStartTime > updatedOperation.startTime) {
        updatedOperation.endTime = newStartTime;
      }
    }

    // ドラッグ位置が中間の場合の処理
    if (dragPosition === 'middle') {
      // 操作の期間（ミリ秒）を計算します。
      const operationDuration = movedOperation.endTime.getTime() - movedOperation.startTime.getTime();

      // 新しい開始時間を設定します。
      updatedOperation.startTime = newStartTime;

      // 新しい終了時間を、開始時間に期間を加えて計算します（15分刻み）。
      const newEndTime = new Date(newStartTime.getTime() + Math.floor(operationDuration / 900000) * 900000);

      // 開始日時の2日後の00:00:00を計算
      const twoDateLater = new Date(beginDate);
      twoDateLater.setDate(beginDate.getDate() + 2);
      twoDateLater.setHours(0, 0, 0, 0);

      // 新しい終了時間が開始日時の2日後の00:00:00を超える場合は、ドラッグ＆ドロップをキャンセル
      if (newEndTime.getTime() > twoDateLater.getTime()) {
        return;
      }

      updatedOperation.endTime = newEndTime;
    }

    // 更新後のツアーデータを新しい配列として作成します。
    const updatedTours = tours.map((tour, index) => {
      if (index === tourIndex) {
        return {
          ...tour,
          operations: tour.operations.map((operation, index) =>
            index === operationIndex ? updatedOperation : operation
          ),
        };
      }
      return tour;
    });

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
            <div key={tour.id} className="flex mb-4 w-[2400px]">
              <div
                onDrop={e => handleDrop(e, tour.id)}
                onDragOver={handleDragOver}
                className="relative h-[74px] rounded-md w-full border-solid border-2 border-zinc-300"
              >
                {Array.from({ length: 47 }, (_, i) => (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0"
                    style={{
                      left: `${((i + 1) / 48) * 100}%`,
                      width: 'calc(100% / 48 - 10px)',
                      borderLeft: '1px solid #ccc',
                      borderRight:
                        i === 46 ? 'none' : '10px solid transparent'
                    }}
                  />
                ))}
                {
                  tour.operations.map(operation => {
                    const operationStartTime = new Date(operation.startTime)
                    const operationEndTime = new Date(operation.endTime)
                    const tourStartTime = beginDate

                    const operationStartTimestamp = operationStartTime.getTime()
                    const operationEndTimestamp = operationEndTime.getTime()
                    const tourStartTimestamp = tourStartTime.getTime()

                    const operationStartHour = Math.floor(
                      (operationStartTimestamp - tourStartTimestamp) / 3600000
                    )
                    const operationEndHour = Math.floor(
                      (operationEndTimestamp - tourStartTimestamp) / 3600000
                    )

                    const operationStartMinute = operationStartTime.getMinutes()
                    const operationEndMinute = operationEndTime.getMinutes()

                    const totalHours = 48

                    const operationStartTimePercentage =
                      ((operationStartHour + operationStartMinute / 60) / totalHours) * 100

                    const operationEndTimePercentage =
                      ((operationEndHour + operationEndMinute / 60) / totalHours) * 100

                    const operationWidthPercentage =
                      operationEndTimePercentage - operationStartTimePercentage


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
