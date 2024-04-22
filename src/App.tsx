import React, { useState } from 'react';

interface OperationData {
  id: number;
  date: Date; // 年月日を表すプロパティを追加
  startTime: Date;
  endTime: Date;
}

interface Tour {
  id: number;
  date: Date; // 年月日を表すプロパティを追加
  operations: OperationData[];
}

const initialOperationData: OperationData[] = [
  { id: 1, date: new Date('2024-04-19'), startTime: new Date('2024-04-19T08:00:00'), endTime: new Date('2024-04-19T10:00:00') },
  { id: 2, date: new Date('2024-04-19'), startTime: new Date('2024-04-19T11:00:00'), endTime: new Date('2024-04-19T13:00:00') },
  { id: 3, date: new Date('2024-04-20'), startTime: new Date('2024-04-20T14:00:00'), endTime: new Date('2024-04-20T16:00:00') },
];

const DragAndDropList: React.FC = () => {
  const [operations, setOperations] = useState<OperationData[]>(initialOperationData);
  const [tours, setTours] = useState<Tour[]>([]);
  const [tourCount, setTourCount] = useState<number>(1);

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, id: number) => {
    event.dataTransfer.setData('operationId', id.toString());
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, tourId: number, tourDate: Date) => {
    event.preventDefault();
    const operationId = Number(event.dataTransfer.getData('operationId'));
    const operationIndex = operations.findIndex(op => op.id === operationId);
    if (operationIndex === -1) return;

    const operation = operations[operationIndex];
    if (operation.date.toDateString() !== tourDate.toDateString()) return; // 開始日が違う操作は追加しない

    const tourIndex = tours.findIndex(t => t.id === tourId);
    if (tourIndex === -1) return;

    const updatedOperations = [...operations];
    const movedOperation = updatedOperations.splice(operationIndex, 1)[0];

    const updatedTours = [...tours];
    updatedTours[tourIndex].operations.push(movedOperation);

    setOperations(updatedOperations);
    setTours(updatedTours);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleRemoveFromTour = (tourId: number, operationId: number) => {
    const tourIndex = tours.findIndex(t => t.id === tourId);
    if (tourIndex === -1) return;

    const operationIndex = tours[tourIndex].operations.findIndex(op => op.id === operationId);
    if (operationIndex === -1) return;

    const removedOperation = tours[tourIndex].operations.splice(operationIndex, 1)[0];
    setTours([...tours]);

    setOperations([...operations, removedOperation]);
  };

  const handleAddTour = (date: Date) => {
    const newTour: Tour = { id: tourCount, date, operations: [] }; // ツアーに年月日を追加
    setTours([...tours, newTour]);
    setTourCount(prevCount => prevCount + 1);
  };

  const handleDeleteTour = (tourId: number) => {
    const updatedTours = tours.filter(tour => tour.id !== tourId);
    setTours(updatedTours);
  };

  const renderTimeBlocks = () => {
    const timeBlocks = [];
    for (let i = 0; i < 24; i++) {
      timeBlocks.push(
        <div key={i} style={{ flex: '0 0 auto', width: '50px', borderRight: '1px solid #ccc', padding: '5px 0', textAlign: 'center' }}>
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

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ display: 'flex', flexDirection: 'column', marginRight: '10px', borderBottom: '1px solid #ccc' }}>
        {Object.entries(groupedOperations).map(([date, ops]) => (
          <div key={date} style={{ marginBottom: '20px' }}>
            <h2>{date}</h2>
            {ops.map(operation => (
              <div
                key={operation.id}
                draggable
                onDragStart={e => handleDragStart(e, operation.id)}
                style={{ margin: '5px 0', padding: '5px', border: '1px solid #ccc', borderRadius: '5px' }}
              >
                Operation: {operation.startTime.toLocaleTimeString()} - {operation.endTime.toLocaleTimeString()}
              </div>
            ))}
            <button onClick={() => handleAddTour(new Date(date))}>Add Tour</button>
          </div>
        ))}
      </div>
      <div style={{ flexGrow: 1 }}>
        {tours.map(tour => (
          <div key={tour.id} onDrop={e => handleDrop(e, tour.id, tour.date)} onDragOver={handleDragOver} style={{ marginBottom: '20px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <h3>Tour {tour.id}</h3>
              <button onClick={() => handleDeleteTour(tour.id)}>Delete Tour</button>
            </div>
            <div style={{ position: 'absolute', top: '30px', bottom: '0', left: '0', right: '0', display: 'flex', alignItems: 'center' }}>
              {renderTimeBlocks()}
              {tour.operations.map(operation => {
                const operationDuration = operation.endTime.getTime() - operation.startTime.getTime();
                const operationStartTimePercentage = (operation.startTime.getHours() * 60 + operation.startTime.getMinutes()) / (24 * 60) * 100;
                const operationWidthPercentage = (operationDuration / (24 * 60 * 60 * 1000)) * 100;
                return (
                  <div
                    key={operation.id}
                    style={{
                      position: 'absolute',
                      left: `${operationStartTimePercentage}%`,
                      width: `${operationWidthPercentage}%`,
                      background: '#007bff',
                      color: '#fff',
                      padding: '5px',
                      borderRadius: '5px',
                      boxShadow: '0 0 3px rgba(0,0,0,0.3)',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      cursor: 'pointer'
                    }}
                    draggable
                    onDragStart={e => handleDragStart(e, operation.id)}
                    onClick={() => handleRemoveFromTour(tour.id, operation.id)}
                  >
                    {`${operation.startTime.toLocaleTimeString()} - ${operation.endTime.toLocaleTimeString()}`}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DragAndDropList;
