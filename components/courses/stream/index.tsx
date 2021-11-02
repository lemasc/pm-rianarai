import { TabPanel, TabPanelProps } from 'react-tabs'

import TeacherImage from '@/components/teacher/image'
import GoogleBadge from '@/components/teacher/google'
import { WithSideBar, SideBar, SideBarWidget, WidgetText } from '../sidebar'
import Feed from './feed'
import { useCourseView } from '../viewContext'
import launchMeeting from '@/shared/meeting'

export default function StreamTab(props: Omit<TabPanelProps, 'ref'>) {
  const { teacher } = useCourseView()
  return (
    <TabPanel {...props}>
      <WithSideBar>
        <SideBar>
          <SideBarWidget>
            <h3 className="font-medium">ข้อมูลผู้สอน</h3>
            <TeacherImage className="my-2" teacher={teacher} width={60} height={60} />
            <div className="flex flex-col gap-1 items-center justify-center sarabun-font">
              <WidgetText className="font-bold" value={teacher?.displayName} multiple={1.5} />
              <WidgetText show={teacher !== undefined} multiple={2}>
                <GoogleBadge />
              </WidgetText>
              <WidgetText value={teacher && `วิชา${teacher?.subject}`} multiple={3} />
              <button
                className="kanit-font zoom-btn"
                onClick={() => launchMeeting(teacher.meetings)}
              >
                เข้าสู่ห้องเรียน
              </button>
            </div>
          </SideBarWidget>
        </SideBar>
        <div className="flex flex-col gap-6 flex-grow">
          <Feed />
        </div>
      </WithSideBar>
    </TabPanel>
  )
}

StreamTab.tabsRole = 'TabPanel'
