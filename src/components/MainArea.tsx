import React, { useEffect, useState } from 'react'

export type TourDto = {
  /** ツアーID */
  tourId: number;
  /** 開始日時 */
  beginDateTime: string;
  /** 終了日時 */
  endDateTime: string;
  /** tourOperation */
  tourOperations: TourOperationDto[];
};

export type TourOperationDto = {
  /** TourOperaiton ID */
  tourOperationId: number;
  /**
   * 運行区分
   * - LOCAL (地場)
   * - REST (休憩)
   */
  operationType: 'LOCAL' | 'REST';
  /**
   * 運行
   * operationTypeが以下の場合に設定される
   * - MAIN_LINE (幹線)
   * - LOCAL (地場)
   */
  transportOperation?: number;
  /** 開始日時 */
  operationBeginDate: string;
  /** 終了日時 */
  operationEndDeate: string;
  /** 開始場所 */
  startLocation?: LocationDto;
  /** 終了場所 */
  goalLocation?: LocationDto;
  /** 車型 */
  carrierType?: '4t' | '10t';
};

type LocationDto = {
  /** 名前 */
  name: string
};

const initialRestTourOperation: TourOperationDto = {
  tourOperationId: 100,
  operationType: 'REST',
  operationBeginDate: '2024-04-19T11:00:00',
  operationEndDeate: '2024-04-19T12:00:00'
}

const initialTours: TourDto[] = [
  {
    tourId: 1,
    beginDateTime: '2024-04-19T00:00:00',
    endDateTime: '2024-04-19T23:59:59',
    tourOperations: [
      {
        tourOperationId: 1,
        operationType: 'LOCAL',
        operationBeginDate: '2024-04-19T08:00:00',
        operationEndDeate: '2024-04-19T12:00:00',
        carrierType: '4t',
      },
      {
        tourOperationId: 2,
        operationType: 'LOCAL',
        operationBeginDate: '2024-04-19T11:00:00',
        operationEndDeate: '2024-04-19T13:00:00',
        carrierType: '10t',
      },
    ],
  },
  {
    tourId: 2,
    beginDateTime: '2024-04-19T00:00:00',
    endDateTime: '2024-04-19T23:59:59',
    tourOperations: [
      {
        tourOperationId: 3,
        operationType: 'LOCAL',
        operationBeginDate: '2024-04-19T14:00:00',
        operationEndDeate: '2024-04-19T16:00:00',
        carrierType: '4t',
      },
    ],
  },
  {
    tourId: 3,
    beginDateTime: '2024-04-19T00:00:00',
    endDateTime: '2024-04-19T23:59:59',
    tourOperations: [
      {
        tourOperationId: 4,
        operationType: 'LOCAL',
        operationBeginDate: '2024-04-19T16:00:00',
        operationEndDeate: '2024-04-19T18:00:00',
        carrierType: '10t',
      },
    ],
  },
  {
    tourId: 4,
    beginDateTime: '2024-04-19T00:00:00',
    endDateTime: '2024-04-19T23:59:59',
    tourOperations: [
      {
        tourOperationId: 5,
        operationType: 'LOCAL',
        operationBeginDate: '2024-04-19T17:00:00',
        operationEndDeate: '2024-04-19T20:00:00',
        carrierType: '4t',
      },
      // 日付跨ぎのデータ作成
      {
        tourOperationId: 6,
        operationType: 'LOCAL',
        operationBeginDate: '2024-04-19T23:00:00',
        operationEndDeate: '2024-04-20T01:00:00',
        carrierType: '4t',
      },
      {
        tourOperationId: 7,
        operationType: 'LOCAL',
        operationBeginDate: '2024-04-20T09:00:00',
        operationEndDeate: '2024-04-20T13:00:00',
        carrierType: '4t',
      },
    ],
  },
];

const MainArea = () => {
  const [tours, setTours] = useState<TourDto[]>(initialTours);
  const [tourCount, setTourCount] = useState<number>(5);
  const [isEditMode, setIsEditMode] = useState(false);
  const [restOperation, setRestOperation] = useState<TourOperationDto>(initialRestTourOperation);

  // console.log(tours)

  useEffect(() => {
    if (!isEditMode) {
      const updatedTours = tours.filter(tour => tour.tourOperations.length > 0);
      setTours(updatedTours);
    }
  }, [isEditMode, JSON.stringify(tours)]);

  const handleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    tourOperationId: number,
    isTour: boolean,
    isRest: boolean
  ) => {
    event.dataTransfer.setData('tourOperationId', tourOperationId.toString());
    event.dataTransfer.setData('isTour', isTour.toString());
    event.dataTransfer.setData('isRest', isRest.toString());
  };

  const handleRestOperationDrop = (event: React.DragEvent<HTMLDivElement>, tourId: number) => {
    event.preventDefault();
    const destinationTourIndex = tours.findIndex(t => t.tourId === tourId);
    if (destinationTourIndex === -1) return;

    const updatedTours = [...tours];
    const movedRestOperation = { ...restOperation };

    // ユニークなランダムなIDを生成する
    let newTourOperationId = Math.floor(Math.random() * 1000000);

    // IDが重複しないように確認する
    while (
      updatedTours[destinationTourIndex].tourOperations.some(
        op => op.tourOperationId === newTourOperationId
      )
    ) {
      // 重複する場合は新しいIDを生成する
      newTourOperationId = Math.floor(Math.random() * 1000000);
    }

    movedRestOperation.tourOperationId = newTourOperationId;

    const containerRect = event.currentTarget.getBoundingClientRect();
    const containerLeft = containerRect.left + window.pageXOffset;
    const dropX = event.pageX - containerLeft;
    const containerWidth = containerRect.width;
    const dayDurationMs = 48 * 60 * 60 * 1000;
    const startTimeMs = Math.round((dropX / containerWidth) * dayDurationMs / (30 * 60 * 1000)) * (30 * 60 * 1000);

    const tourDate = new Date(tours[destinationTourIndex].beginDateTime);
    let startTime = new Date(tourDate.getTime() + startTimeMs);
    let endTime;

    const prevDay = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate() - 1);
    const today = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate());
    const nextDay = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate() + 1);
    const tourNextDay = tourDate.getDate() + 1

    if (startTime.getDate() === tourNextDay && startTime.getHours() >= 23 ) {
      startTime = new Date(today.getTime() + 23 * 60 * 60 * 1000);
      endTime = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    } else if (startTime.getDate() === tourNextDay + 1) {
      startTime = new Date(prevDay.getTime() + 23 * 60 * 60 * 1000);
      endTime = new Date(prevDay.getTime() + 24 * 60 * 60 * 1000);
    } else if (startTime.getHours() === 23 && startTime.getMinutes() === 30) {
      endTime = new Date(nextDay.getTime() + 30 * 60 * 1000); // 翌日0:30
    } else {
      endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1時間後
    }

    movedRestOperation.operationBeginDate = startTime.toISOString();
    movedRestOperation.operationEndDeate = endTime.toISOString();
    updatedTours[destinationTourIndex].tourOperations.push(movedRestOperation);

    setTours(updatedTours);

    // 元の休憩データを更新する
    const newRestOperation: TourOperationDto = {
      tourOperationId: restOperation.tourOperationId,
      operationType: 'REST',
      operationBeginDate: restOperation.operationBeginDate,
      operationEndDeate: restOperation.operationEndDeate,
    };
    setRestOperation(newRestOperation);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, tourId: number) => {
    event.preventDefault();
    const tourOperationId = Number(event.dataTransfer.getData('tourOperationId'));
    const isTour = event.dataTransfer.getData('isTour') === 'true';
    const isRest = event.dataTransfer.getData('isRest') === 'true';

    if (isTour) {
      const sourceTourIndex = tours.findIndex(t => t.tourOperations.some(op => op.tourOperationId === tourOperationId));
      if (sourceTourIndex === -1) return;

      const destinationTourIndex = tours.findIndex(t => t.tourId === tourId);
      if (destinationTourIndex === -1) return;

      const updatedTours = [...tours];
      const operationIndex = updatedTours[sourceTourIndex].tourOperations.findIndex(op => op.tourOperationId === tourOperationId);
      const movedOperation = updatedTours[sourceTourIndex].tourOperations.splice(operationIndex, 1)[0];
      updatedTours[destinationTourIndex].tourOperations.push(movedOperation);
      setTours(updatedTours);
    } else {
      handleRestOperationDrop(event,tourId);
    }

    if (isRest) {
      const sourceTourIndex = tours.findIndex(t =>
        t.tourOperations.some(op => op.tourOperationId === tourOperationId)
      );
      if (sourceTourIndex === -1) return;

      const operationIndex = tours[sourceTourIndex].tourOperations.findIndex(
        op => op.tourOperationId === tourOperationId
      );
      if (operationIndex === -1) return;

      const updatedTours = [...tours];
      const movedOperation = updatedTours[sourceTourIndex].tourOperations[operationIndex];
      const tourDate = new Date(tours[sourceTourIndex].beginDateTime);

      const containerRect = event.currentTarget.getBoundingClientRect();
      const containerLeft = containerRect.left + window.pageXOffset;
      const dropX = event.pageX - containerLeft;
      const containerWidth = containerRect.width;
      const dayDurationMs = 48 * 60 * 60 * 1000;
      const startTimeMs = Math.round((dropX / containerWidth) * dayDurationMs / (30 * 60 * 1000)) * (30 * 60 * 1000);

      let startTime = new Date(tourDate.getTime() + startTimeMs);
      let endTime;

      const prevDay = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate() - 1);
      const today = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate());
      const nextDay = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate() + 1);
      const tourNextDay = tourDate.getDate() + 1

    if (startTime.getDate() === tourNextDay && startTime.getHours() >= 23 ) {
      startTime = new Date(today.getTime() + 23 * 60 * 60 * 1000);
      endTime = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    } else if (startTime.getDate() === tourNextDay + 1) {
      startTime = new Date(prevDay.getTime() + 23 * 60 * 60 * 1000);
      endTime = new Date(prevDay.getTime() + 24 * 60 * 60 * 1000);
    } else if (startTime.getHours() === 23 && startTime.getMinutes() === 30) {
      endTime = new Date(nextDay.getTime() + 30 * 60 * 1000); // 翌日0:30
    } else {
      endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1時間後
    }

      const updatedOperation = {
        ...movedOperation,
        operationBeginDate: startTime.toISOString(),
        operationEndDeate: endTime.toISOString(),
      };

      updatedTours[sourceTourIndex].tourOperations[operationIndex] = updatedOperation;
      setTours(updatedTours);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleAddTour = (beginDateTime: string, endDateTime: string) => {
    const newTour: TourDto = {
      tourId: tourCount,
      beginDateTime,
      endDateTime,
      tourOperations: [],
    };
    setTours([...tours, newTour]);
    setTourCount(prevCount => prevCount + 1);
  };


  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}年${month}月${day}日`;
  }

  const renderTimeBlocks = () => {
    const timeBlocks = [];
    const totalHours = 48;
    const blockWidth = 50;
    for (let i = 0; i < totalHours; i++) {
      const hour = i % 24;
      const day = Math.floor(i / 24);
      timeBlocks.push(
        <div
          key={i}
          style={{
            width: blockWidth, // 幅を100pxに設定
            borderRight: '1px solid #ccc',
            padding: '10px 0',
            textAlign: 'center',
            fontSize: '14px',
          }}
        >
          {`${hour}:00`}
        </div>
      );
    }
    return (
      <div className="flex-grow relative h-12 flex overflow-x-auto" style={{ width: `${blockWidth * totalHours}px` }}>
        <div className="flex">{timeBlocks}</div>
      </div>
    );
  };

  const renderRestOperations = () => {
    const operationDuration =
      new Date(restOperation.operationEndDeate).getTime() -
      new Date(restOperation.operationBeginDate).getTime();
    const operationStartTimePercentage =
      (new Date(restOperation.operationBeginDate).getHours() * 60 +
        new Date(restOperation.operationBeginDate).getMinutes()) /
      (24 * 60) *
      100;
    const operationWidthPercentage = (operationDuration / (24 * 60 * 60 * 1000)) * 100;

    return (
      <div
        key={restOperation.tourOperationId}
        className="text-white rounded shadow-md overflow-visible whitespace-nowrap text-ellipsis cursor-pointer flex justify-center items-center mb-2"
        style={{
          backgroundColor: 'rgba(224, 118, 236, 0.8)',
          width: 100,
          padding: '8px 16px',
        }}
        draggable={isEditMode}
        onDragStart={e => handleDragStart(e, restOperation.tourOperationId, false, restOperation.operationType === 'REST')}
      >
        <div className="text-center">
          <p>休憩</p>
          {new Date(restOperation.operationBeginDate).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })} - {new Date(restOperation.operationEndDeate).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    );
  };

  return (
    <>
     <div className='max-w-[87%]'>
        <div>
          <div className="bg-green-500 text-white py-4 px-6 my-2">
            <span className="mr-2">{formatDate(tours[0].beginDateTime)}</span>
          </div>
          <div className="flex mr-10 mb-4 text-white">
            <div>
              <button
                className={`px-3 py-2 rounded-md ${isEditMode ? 'bg-red-500' : 'bg-blue-400'}`}
                onClick={() => setIsEditMode(!isEditMode)}
              >
                {isEditMode ? '編集を終了する' : '編集する'}
              </button>
              {isEditMode ? (
                <button
                  className="ml-3 px-3 py-2 bg-blue-400 rounded-md"
                  onClick={() => handleAddTour(tours[0].beginDateTime, tours[0].endDateTime)}
                >
                  ツアーを追加
                </button>
              ) : (
                ''
              )}
            </div>
          </div>

          <div className='flex'>
            <div className='mt-[60px] w-[200px]'>
              {tours.map(tour => (
                  <div key={tour.tourId} className="flex mb-[57px] ">
                    <p className='text-xl'>{`ツアー ${tour.tourId}`}</p>
                  </div>
              ))}

            </div>
            <div className="overflow-auto">
              <div className="flex">
                <div className="w-16"></div>
                <div className="flex-grow relative h-12 flex items-center">
                  {renderTimeBlocks()}
                </div>
              </div>
              {tours.map(tour => (
                <div key={tour.tourId} className="flex mb-5 w-[2400px]">

                  <div
                    onDrop={e => handleDrop(e, tour.tourId)}
                    onDragOver={handleDragOver}
                    className="relative h-16 border-2 border-dashed border-gray-300 rounded-md flex justify-center items-center bg-gray-100"
                    style={{ width: '100%' }}
                  >
                    {tour.tourOperations.length === 0 ? (
                      <p className="text-gray-500">編集後に空白のツアーは削除されます。</p>
                    ) : (
                      tour.tourOperations.map(operation => {
                        const operationStartTime = new Date(operation.operationBeginDate);
                        const operationEndTime = new Date(operation.operationEndDeate);
                        const tourStartTime = new Date(tour.beginDateTime);

                        const operationStartHour = operationStartTime.getHours() + (operationStartTime.getDate() - tourStartTime.getDate()) * 24;
                        const operationStartMinute = operationStartTime.getMinutes();
                        const operationEndHour = operationEndTime.getHours() + (operationEndTime.getDate() - tourStartTime.getDate()) * 24;
                        const operationEndMinute = operationEndTime.getMinutes();
                        const totalHours = 48;

                        const operationStartTimePercentage = ((operationStartHour + operationStartMinute / 60) / totalHours) * 100;
                        const operationEndTimePercentage = ((operationEndHour + operationEndMinute / 60) / totalHours) * 100;
                        const operationWidthPercentage = operationEndTimePercentage - operationStartTimePercentage;

                        const backgroundColor =
                          operation.operationType === 'REST'
                            ? 'rgba(224, 118, 236, 0.8)'
                            : operation.carrierType === '4t'
                            ? 'rgba(0, 123, 255, 0.8)'
                            : 'rgba(218, 136, 13, 0.8)';

                        return (
                          <div
                            key={operation.tourOperationId}
                            className="absolute text-white rounded shadow-md overflow-hidden whitespace-nowrap text-ellipsis cursor-pointer flex justify-center items-center h-full"
                            style={{
                              left: `${operationStartTimePercentage}%`,
                              width: `${operationWidthPercentage}%`,
                              backgroundColor,
                            }}
                            draggable={isEditMode}
                            onDragStart={e => handleDragStart(e, operation.tourOperationId, true, operation.operationType === 'REST')}
                          >
                            {new Date(operation.operationBeginDate).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })} - {new Date(operation.operationEndDeate).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 休憩タグエリア */}
        <div className="flex justify-center gap-x-3">
          {renderRestOperations()}
        </div>
      </div>
    </>
  );

}

export default MainArea