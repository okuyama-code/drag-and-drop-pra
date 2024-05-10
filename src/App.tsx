import React, { useEffect, useState } from 'react';

interface OperationData {
  id: number;
  date: Date;
  startTime: Date;
  endTime: Date;
  car_model: string;
  type: 'drive' | 'rest'; // 操作の種類を表す新しいプロパティ
}

interface Tour {
  id: number;
  date: Date; // 年月日を表すプロパティを追加
  operations: OperationData[];
}

const initialOperationData: OperationData[] = [
  { id: 1, date: new Date('2024-04-19'), startTime: new Date('2024-04-19T08:00:00'), endTime: new Date('2024-04-19T12:00:00'), car_model: 'xx', type: 'drive' },
  { id: 2, date: new Date('2024-04-19'), startTime: new Date('2024-04-19T11:00:00'), endTime: new Date('2024-04-19T13:00:00'), car_model: 'yy', type: 'drive' },
  { id: 3, date: new Date('2024-04-19'), startTime: new Date('2024-04-20T14:00:00'), endTime: new Date('2024-04-20T16:00:00'), car_model: 'xx', type: 'drive' },
  { id: 4, date: new Date('2024-04-19'), startTime: new Date('2024-04-20T16:00:00'), endTime: new Date('2024-04-20T18:00:00'), car_model: 'yy', type: 'drive' },
  { id: 5, date: new Date('2024-04-19'), startTime: new Date('2024-04-20T17:00:00'), endTime: new Date('2024-04-20T20:00:00'), car_model: 'xx', type: 'drive' },
  // =========================== 休憩のデータ =====================
  { id: 6, date: new Date('2024-04-19'), startTime: new Date('2024-04-20T13:00:00'), endTime: new Date('2024-04-20T14:00:00'), car_model: 'xx', type: 'rest' },
];

const initialTours: Tour[] = [
  { id: 1, date: new Date('2024-04-19'), operations: [initialOperationData[0], initialOperationData[1]] },
  { id: 2, date: new Date('2024-04-19'), operations: [initialOperationData[2]] },
  { id: 3, date: new Date('2024-04-19'), operations: [initialOperationData[3]] },
  { id: 4, date: new Date('2024-04-19'), operations: [initialOperationData[4], initialOperationData[5]] },
];

const DragAndDropList: React.FC = () => {
  const [operations, setOperations] = useState<OperationData[]>([]);
  const [tours, setTours] = useState<Tour[]>(initialTours);
  const [tourCount, setTourCount] = useState<number>(5);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (!isEditMode) {
      const updatedTours = tours.filter(tour => tour.operations.length > 0);
      setTours(updatedTours);
    }
  }, [isEditMode, tours]);

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, id: number, isTour: boolean) => {
    event.dataTransfer.setData('operationId', id.toString());
    event.dataTransfer.setData('isTour', isTour.toString());
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, tourId: number) => {
    event.preventDefault();
    const operationId = Number(event.dataTransfer.getData('operationId'));
    const isTour = event.dataTransfer.getData('isTour') === 'true';

    if (isTour) {
      const sourceTourIndex = tours.findIndex(t => t.operations.some(op => op.id === operationId));
      if (sourceTourIndex === -1) return;

      const destinationTourIndex = tours.findIndex(t => t.id === tourId);
      if (destinationTourIndex === -1) return;

      const updatedTours = [...tours];
      const operationIndex = updatedTours[sourceTourIndex].operations.findIndex(op => op.id === operationId);
      const movedOperation = updatedTours[sourceTourIndex].operations.splice(operationIndex, 1)[0];
      updatedTours[destinationTourIndex].operations.push(movedOperation);
      setTours(updatedTours);
    } else {
      const operationIndex = operations.findIndex(op => op.id === operationId);
      if (operationIndex === -1) return;

      const tourIndex = tours.findIndex(t => t.id === tourId);
      if (tourIndex === -1) return;

      const updatedOperations = [...operations];
      const movedOperation = updatedOperations.splice(operationIndex, 1)[0];

      const updatedTours = [...tours];
      updatedTours[tourIndex].operations.push(movedOperation);

      setOperations(updatedOperations);
      setTours(updatedTours);
    }
  };


  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleAddTour = (date: Date) => {
    const newTour: Tour = { id: tourCount, date, operations: [] }; // ツアーに年月日を追加
    setTours([...tours, newTour]);
    setTourCount(prevCount => prevCount + 1);
  };


  const renderTimeBlocks = () => {
    const timeBlocks = [];
    const totalMinutes = 24 * 60;
    for (let i = 0; i < 24; i++) {
      const minutesPercentage = (i * 60) / totalMinutes * 100;
      const nextMinutesPercentage = ((i + 1) * 60) / totalMinutes * 100;
      const blockWidth = `${nextMinutesPercentage - minutesPercentage}%`;
      timeBlocks.push(
        <div key={i} style={{ flex: '0 0 auto', width: blockWidth, borderRight: '1px solid #ccc', padding: '5px 0', textAlign: 'center' }}>
          {`${i}:00`}
        </div>
      );
    }
    return timeBlocks;
  };

  // 年月日ごとに操作をグループ化する
  const groupedOperations: { [date: string]: OperationData[] } = {};
  operations.forEach(operation => {
    const key = operation.date.toDateString();
    if (!groupedOperations[key]) {
      groupedOperations[key] = [];
    }
    groupedOperations[key].push(operation);
  });

  function formatDate(date: Date) {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}年${month}月${day}日`;
  }

  return (
    <>
      <div className="flex">
        <div className="flex flex-grow">
          {/* =============== sidebar ===================== */}
          <div className="w-40 mr-5">
           sidebar
          </div>
          {/* =============== sidebar ===================== */}

          {/* ================== main ===================== */}
          <div className="flex-grow">
            <div className="bg-green-500 text-white py-4 px-6 my-2">
              <span className="mr-2">{formatDate(tours[0].date)}</span>
            </div>
            <div className="flex justify-end mr-10 mb-4 text-white">
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
                    onClick={() => handleAddTour(tours[0].date)}
                  >
                    ツアーを追加
                  </button>
                ) : (
                  ''
                )}
              </div>
            </div>
            <div className="flex">
              <div className="w-16"></div>
              <div className="flex-grow relative h-12 flex items-center">
                {renderTimeBlocks()}
              </div>
            </div>
            {tours.map(tour => (
              <div
                key={tour.id}
                className="flex mb-5"
              >
                <div className="w-16 flex items-center justify-center">
                  <span>ツアー {tour.id}</span>
                </div>
                <div
                  onDrop={e => handleDrop(e, tour.id)}
                  onDragOver={handleDragOver}
                  className="flex-grow relative h-16 border-2 border-dashed border-gray-300 rounded-md flex justify-center items-center bg-gray-100"
                >
                  {tour.operations.length === 0 ? (
                    <p className="text-gray-500">Drag and drop operations here</p>
                  ) : (
                    tour.operations.map(operation => {
                      const operationDuration = operation.endTime.getTime() - operation.startTime.getTime();
                      const operationStartTimePercentage = (operation.startTime.getHours() * 60 + operation.startTime.getMinutes()) / (24 * 60) * 100;
                      const operationWidthPercentage = (operationDuration / (24 * 60 * 60 * 1000)) * 100;
                      const backgroundColor = operation.car_model === 'xx' ? 'rgba(0, 123, 255, 0.8)' : 'rgba(218, 136, 13, 0.8)';
                      return (
                        <div
                          key={operation.id}
                          className="absolute text-white rounded shadow-md overflow-hidden whitespace-nowrap text-ellipsis cursor-pointer flex justify-center items-center h-full"
                          style={{
                            left: `${operationStartTimePercentage}%`,
                            width: `${operationWidthPercentage}%`,
                            backgroundColor,
                          }}
                          draggable={isEditMode}
                          onDragStart={e => handleDragStart(e, operation.id, true)}
                        >
                          {`${operation.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${operation.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* ================== main ===================== */}

        </div>
      </div>
    </>
  );

};

export default DragAndDropList;
