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
  { id: 3, date: new Date('2024-04-19'), startTime: new Date('2024-04-20T14:00:00'), endTime: new Date('2024-04-20T16:00:00') },
  { id: 4, date: new Date('2024-04-19'), startTime: new Date('2024-04-20T16:00:00'), endTime: new Date('2024-04-20T17:00:00') },
  { id: 5, date: new Date('2024-04-19'), startTime: new Date('2024-04-20T18:00:00'), endTime: new Date('2024-04-20T19:00:00') },
];

const initialTours: Tour[] = [
  { id: 1, date: new Date('2024-04-19'), operations: [initialOperationData[0], initialOperationData[1]] },
  { id: 2, date: new Date('2024-04-19'), operations: [initialOperationData[2]] },
  { id: 3, date: new Date('2024-04-19'), operations: [initialOperationData[3]] },
  { id: 4, date: new Date('2024-04-19'), operations: [initialOperationData[4]] },
];

const DragAndDropList: React.FC = () => {
  const [operations, setOperations] = useState<OperationData[]>([]);
  const [tours, setTours] = useState<Tour[]>(initialTours);
  const [tourCount, setTourCount] = useState<number>(5);

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, id: number, isTour: boolean) => {
    event.dataTransfer.setData('operationId', id.toString());
    event.dataTransfer.setData('isTour', isTour.toString());
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, tourId: number, tourDate: Date) => {
    event.preventDefault();
    const operationId = Number(event.dataTransfer.getData('operationId'));
    const isTour = event.dataTransfer.getData('isTour') === 'true';

    if (isTour) {
      const tourIndex = tours.findIndex(t => t.id === tourId);
      if (tourIndex === -1) return;

      const operationIndex = tours[tourIndex].operations.findIndex(op => op.id === operationId);
      if (operationIndex === -1) return;

      const updatedTours = [...tours];
      const movedOperation = updatedTours[tourIndex].operations[operationIndex];
      const startTimePercentage = (event.nativeEvent.offsetX / event.currentTarget.clientWidth) * 100;
      const startHour = Math.floor((startTimePercentage / 100) * 24);
      const startMinute = Math.round((((startTimePercentage / 100) * 24) % 1) * 60);
      const endTime = new Date(movedOperation.startTime.getTime() + (movedOperation.endTime.getTime() - movedOperation.startTime.getTime()));
      const updatedOperation = {
        ...movedOperation,
        startTime: new Date(tourDate.getFullYear(), tourDate.getMonth(), tourDate.getDate(), startHour, startMinute),
        endTime: new Date(tourDate.getFullYear(), tourDate.getMonth(), tourDate.getDate(), endTime.getHours(), endTime.getMinutes()),
      };
      updatedTours[tourIndex].operations[operationIndex] = updatedOperation;
      setTours(updatedTours);
    } else {
      const operationIndex = operations.findIndex(op => op.id === operationId);
      if (operationIndex === -1) return;

      const operation = operations[operationIndex];
      if (operation.date.toDateString() !== tourDate.toDateString()) return; // 開始日が違う操作は追加しない

      const tourIndex = tours.findIndex(t => t.id === tourId);
      if (tourIndex === -1) return;

      const updatedOperations = [...operations];
      const movedOperation = updatedOperations.splice(operationIndex, 1)[0];

      const updatedTours = [...tours];
      const movedOperations = { ...movedOperation, startTime: new Date(tourDate.toDateString() + ' ' + movedOperation.startTime.toTimeString()), endTime: new Date(tourDate.toDateString() + ' ' + movedOperation.endTime.toTimeString()) };

      updatedTours[tourIndex].operations.push(movedOperations);

      setOperations(updatedOperations);
      setTours(updatedTours);
      console.log(tours)
    }
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

   return (
    <>
      <div style={{ display: 'flex' }}>

        <div style={{ display: 'flex', flexDirection: 'column', marginRight: '10px', borderBottom: '1px solid #ccc' }}>
          {Object.entries(groupedOperations).map(([date, ops]) => (
            <div key={date} style={{ marginBottom: '20px' }}>
              <h2>{date}</h2>
              {ops.map(operation => (
                <div
                  key={operation.id}
                  draggable
                  onDragStart={e => handleDragStart(e, operation.id, false)}
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
          <div style={{ position: 'relative', height: '50px', display: 'flex', alignItems: 'center' }}>
            {renderTimeBlocks()}
          </div>
          {tours.map(tour => (
            <div key={tour.id} style={{ marginBottom: '20px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <h3>Tour {tour.id}</h3>
                <button onClick={() => handleDeleteTour(tour.id)}>Delete Tour</button>
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
                {tour.operations.length === 0 ? (
                  <p style={{ color: '#999' }}>Drag and drop operations here</p>
                ) : (
                  tour.operations.map(operation => {
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
                        draggable
                        onDragStart={e => handleDragStart(e, operation.id, true)}
                        onClick={() => handleRemoveFromTour(tour.id, operation.id)}
                      >
                        {`${operation.startTime.toLocaleTimeString()} - ${operation.endTime.toLocaleTimeString()}`}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </>
  );
};

export default DragAndDropList;
