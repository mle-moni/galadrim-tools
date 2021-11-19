import { observer } from 'mobx-react-lite'
import moment from 'moment'
import 'moment/locale/es'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { AppStore } from '../../stores/AppStore'
import { MomentFrLocales } from './setFrLocales'

moment.locale('fr', MomentFrLocales)

const localizer = momentLocalizer(moment)

// @ts-ignore
const DragAndDropCalendar = withDragAndDrop(Calendar)

export const RoomCalendar = observer(() => (
    <div
        style={{
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            backgroundColor: 'var(--main-color)',
        }}
    >
        <div style={{ width: '80vw', backgroundColor: 'white' }}>
            <DragAndDropCalendar
                selectable
                min={new Date(0, 0, 0, 9, 0, 0)}
                max={new Date(0, 0, 0, 19, 30, 0)}
                step={15}
                resizableAccessor={() => false}
                localizer={localizer}
                events={AppStore.eventsStore.roomEvents}
                defaultDate={new Date()}
                defaultView="day"
                views={['day', 'work_week']}
                messages={{
                    work_week: 'semaine',
                    day: 'jour',
                    today: "aujourd'hui",
                    next: 'suivant',
                    previous: 'précédent',
                }}
                onNavigate={(date) => AppStore.eventsStore.onNavigate(date)}
                onEventDrop={(args) => AppStore.eventsStore.onEventDrop(args)}
                onSelectSlot={({start, end}) => AppStore.eventsStore.newEvent(new Date(start), new Date(end))}
                onDoubleClickEvent={(args) => AppStore.eventsStore.onDoubleClickEvent(args)}
                onRangeChange={(range) => AppStore.eventsStore.onRangeChange(range)}
            />
        </div>
    </div>
))
