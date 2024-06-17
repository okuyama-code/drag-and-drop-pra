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
  const dragPosition = event.dataTransfer.getData('dragPosition') as 'start' | 'end' | 'middle';

    const tourIndex = tours.findIndex(t => t.id === tourId);
    if (tourIndex === -1) return;

    const operationIndex = tours[tourIndex].operations.findIndex(op => op.id === operationId);
    if (operationIndex === -1) return;

    const updatedTours = [...tours];
    const movedOperation = updatedTours[tourIndex].operations[operationIndex];
    const dropTarget = event.currentTarget.getBoundingClientRect();
    const startTimePercentage = ((event.clientX - dropTarget.left) / dropTarget.width) * 100;
    const startMinutes = Math.round((startTimePercentage / 100) * 24 * 60 / 15) * 15;
    const startHour = Math.floor(startMinutes / 60);
    const startMinute = startMinutes % 60;

    let updatedOperation: OperationData = { ...movedOperation };

    if (dragPosition === 'start') {
      const newStartTime = new Date(tourDate.getFullYear(), tourDate.getMonth(), tourDate.getDate(), startHour, startMinute);
      if (newStartTime < updatedOperation.endTime) {
        updatedOperation.startTime = newStartTime;
      }
    }

    if (dragPosition === 'end') {
      const newEndTime = new Date(tourDate.getFullYear(), tourDate.getMonth(), tourDate.getDate(), startHour, startMinute);
      if (newEndTime > updatedOperation.startTime) {
        updatedOperation.endTime = newEndTime;
      }
    }

    if (dragPosition === 'middle') {
      const operationDuration = movedOperation.endTime.getTime() - movedOperation.startTime.getTime();
      updatedOperation.startTime = new Date(tourDate.getFullYear(), tourDate.getMonth(), tourDate.getDate(), startHour, startMinute);
      updatedOperation.endTime = new Date(tourDate.getFullYear(), tourDate.getMonth(), tourDate.getDate(), startHour, startMinute + Math.floor(operationDuration / 60000 / 15) * 15);
    }

    updatedTours[tourIndex].operations[operationIndex] = updatedOperation;
    setTours(updatedTours);

  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
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
