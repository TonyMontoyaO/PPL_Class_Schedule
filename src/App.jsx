import { useState, useRef, useEffect } from "react";
import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import ViewSchedulePage from "./ViewSchedulePage";
import ClassCard from "./ClassCard";
import "./homepage/homepage.css";

const ItemTypes = {
  CLASS: "class",
};

function WeekGrid() {
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const hoursOfDay = Array.from({ length: 13 }, (_, i) => i + 8);

  return (
    <div className="container mt-4">
      <div className="week-grid">
        <div className="grid-header d-flex">
          <div className="hour-label"></div>
          {daysOfWeek.map((day) => (
            <div key={day} className="day-header text-center flex-grow-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid-body">
          {hoursOfDay.map((hour) => (
            <div className="grid-row d-flex align-items-center" key={hour}>
              <div className="hour-label text-center">{hour}:00</div>
              {daysOfWeek.map((day) => (
                <div key={`${hour}-${day}`} className="grid-cell border flex-grow-1"></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GridCell({ room, time, onDropClass, classInCell }) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.CLASS,
    drop: (item) => onDropClass(room, time, item.className),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div ref={drop} className={`grid-cell ${isOver ? "bg-light" : ""}`}>
      {classInCell && (
        <div className="p-2 bg-success text-white rounded">{classInCell}</div>
      )}
    </div>
  );
}

function ScheduleGrid() {
  const roomNumbers = [
    "020", "022", "023", "025", "033", "035", "037", "039", "041", "106",
    "109", "121", "122", "123", "124", "128", "129", "131", "135", "137", "139",
    "141", "221", "222", "223", "224", "226", "229", "231",
  ];
  const timesOfDay = Array.from({ length: 48 }, (_, i) => 8 * 60 + i * 15);

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours > 12 ? hours - 12 : hours;
    return `${displayHour}:${mins === 0 ? "00" : mins} ${period}`;
  };

  const [schedule, setSchedule] = useState({});
  const scrollContainerRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    const syncScroll = () => {
      if (scrollContainerRef.current && headerRef.current) {
        headerRef.current.scrollLeft = scrollContainerRef.current.scrollLeft;
      }
    };

    const scrollElement = scrollContainerRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", syncScroll);
    }

    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener("scroll", syncScroll);
      }
    };
  }, []);

  const handleDropClass = (room, time, className) => {
    setSchedule((prev) => ({
      ...prev,
      [`${room}-${time}`]: className,
    }));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="schedule-container">
        <div className="grid-header-container" ref={headerRef}>
          <div className="grid-header">
            <div className="hour-label">Time</div>
            {roomNumbers.map((room) => (
              <div key={room} className="day-header">
                {room}
              </div>
            ))}
          </div>
        </div>

        <div className="scroll-container" ref={scrollContainerRef}>
          <div className="grid-body">
            {timesOfDay.map((time) => (
              <div className="grid-row" key={time}>
                <div className="hour-label">{formatTime(time)}</div>
                {roomNumbers.map((room) => (
                  <GridCell
                    key={`${time}-${room}`}
                    room={room}
                    time={time}
                    onDropClass={handleDropClass}
                    classInCell={schedule[`${room}-${time}`]}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="class-list">
          <ClassCard className="Math 101" />
          <ClassCard className="Physics 202" />
          <ClassCard className="Chemistry 303" />
        </div>
      </div>
    </DndProvider>
  );
}

function App() {
  return (
    <>
      <ViewSchedulePage />
      <ClassCard className="Sample Class" />
      <WeekGrid />
      <ScheduleGrid />
    </>
  );
}

export default App;
