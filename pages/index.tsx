import Head from "next/head";
import { useAuth } from "../shared/authContext";
import { ReactNode, useState } from "react";
import { Transition } from "@headlessui/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  AcademicCapIcon,
  ClockIcon,
  SpeakerphoneIcon,
  BookOpenIcon,
} from "@heroicons/react/outline";
import LayoutComponent, { CONTAINER, HEADER } from "../components/layout";
import SignInComponent from "../components/signin";
import { useMeeting } from "../shared/meetingContext";
import { getUnreadAnnounce } from "../components/menubar";
import { useEffect } from "react";
import { db } from "../shared/db";
import { useLiveQuery } from "dexie-react-hooks";
import { time } from "./work";

const WelcomeComponent = dynamic(() => import("../components/welcome"));
const MetaDataComponent = dynamic(() => import("../components/meta"));
const TimeSlotsComponent = dynamic(() => import("../components/timeslots"));
const PWAPromoComponent = dynamic(() => import("../components/pwa"));
const AnnouncementComponent = dynamic(() => import("../components/announce"));

interface SPAProps {
  children: ReactNode;
  title?: string;
  desc?: string;
}

function MultiComponent(props: SPAProps): JSX.Element {
  const [prevState, setPrevState] = useState(props);
  return (
    <Transition
      show={props.title == prevState.title}
      enter="transition duration-700"
      enterFrom="opacity-0"
      enterTo="opactity-100"
      leave="transition duration-500"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      className="flex flex-col text-center items-center"
      afterLeave={() => setPrevState(props)}
    >
      <div className="px-4 m-4 w-full">
        {prevState.title && (
          <h2 className="text-2xl font-bold py-4 creative-font">
            {prevState.title}
          </h2>
        )}
        {prevState.desc && (
          <span className="py-4 font-light">{prevState.desc}</span>
        )}
      </div>
      <div className="w-full p-4 bg-gray-100">{prevState.children}</div>
    </Transition>
  );
}

export default function MainPage(): JSX.Element {
  const { ready, user, metadata, announce, classroom } = useAuth();
  const { date, schedule, curDay } = useMeeting();
  const [showAnnounce, setAnnounce] = useState(false);
  const [hero, showHero] = useState(false);
  const work = useLiveQuery(() =>
    db.courseWork
      .where("dueDate")
      .between(time[0].startTime, time[0].endTime)
      .count()
  );
  useEffect(() => {
    if (!ready || user) return;
    setTimeout(() => showHero(true), 1500);
  }, [ready, user]);
  return (
    <div
      className={
        "overflow-hidden min-h-screen flex flex-col dark:bg-gray-900 dark:text-white" +
        (ready &&
          (metadata ? "" : " items-center justify-center background-hero"))
      }
    >
      <Head>
        <title>
          {ready
            ? (user && metadata ? "หน้าหลัก" : "ยินดีต้อนรับ") + " : "
            : ""}
          PM-RianArai
        </title>
        <meta
          name="title"
          content="PM-RianArai : เข้าเรียนทุกวิชาได้จากทีนี่ที่เดียว"
        />
        <meta
          name="description"
          content="PM-RianArai เว็บไซต์สำหรับนักเรียนโรงเรียนมัธยมสาธิตวัดพระศรีมหาธาตุ ที่จะทำให้การเข้าเรียนเป็นทุกรายวิชาเป็นเรื่องง่าย รวบรวมทุกอย่างไว้ในที่เดียว"
        />
        <meta property="og:url" content="https://pm-rianarai.vercel.app" />
        <meta property="og:title" content="PM RianArai - เรียนอะไร" />
        <meta
          property="og:description"
          content="เข้าเรียนทุกวิชาได้จากทีนี่ที่เดียว"
        />
      </Head>
      <LayoutComponent>
        {ready && (
          <>
            {user && metadata ? (
              <>
                <div className={CONTAINER}>
                  <div className={"flex " + HEADER}>
                    <h2 className="flex-grow">สวัสดี {metadata.displayName}</h2>
                    <span className="text-2xl md:flex hidden items-center creative-font text-gray-500 select-none">
                      <ClockIcon className="mr-2 h-8 w-8" />
                      <span className="w-20">
                        {date.toLocaleTimeString("th-TH")}
                      </span>
                    </span>
                  </div>
                  <div className="flex md:flex-row flex-col md:gap-8">
                    <div className="flex flex-1 flex-col flex-grow md:gap-8 gap-6">
                      <div className="flex flex-grow shadow-md rounded bg-gray-100 dark:bg-gray-800 p-4">
                        <TimeSlotsComponent />
                      </div>
                      <div className="grid md:grid-cols-2 md:pb-10 md:gap-16 pb-6">
                        <Link href="/timetable">
                          <a
                            title="ตารางสอน"
                            className="items-center flex flex-row shadow-md rounded bg-apple-500 hover:bg-gradient-to-b from-apple-500 to-apple-600 text-white p-6"
                          >
                            <div className="flex flex-col flex-grow items-start">
                              <h4 className="py-2 text-2xl font-medium">
                                ตารางสอน
                              </h4>
                              <span className="py-2 text-sm sarabun-font">
                                {schedule &&
                                schedule[curDay] &&
                                schedule[curDay].length
                                  ? schedule[curDay].length
                                  : 0}{" "}
                                รายวิชาที่ต้องเรียนวันนี้
                              </span>
                            </div>
                            <BookOpenIcon className="md:h-12 md:w-12 w-10 h-10" />
                          </a>
                        </Link>
                        <div className="md:flex hidden items-center flex-row shadow-md rounded bg-blue-500 hover:bg-gradient-to-b from-blue-500 to-blue-600 text-white p-6">
                          <button
                            onClick={() => setAnnounce(true)}
                            className="focus:outline-none flex flex-col flex-grow items-start"
                          >
                            <h4 className="py-2 text-2xl font-medium">
                              ประกาศ
                            </h4>
                            <span className="py-2 text-sm sarabun-font">
                              {getUnreadAnnounce(announce, metadata).length}{" "}
                              ประกาศที่ยังไม่ได้อ่าน
                            </span>
                          </button>
                          <SpeakerphoneIcon className="md:h-12 md:w-12 w-10 h-10" />
                        </div>
                      </div>
                    </div>
                    <div className="md:w-72 w-full">
                      <div className="items-center flex flex-row rounded-t-lg hover:bg-yellow-500 bg-gradient-to-b from-yellow-400 to-yellow-500 text-white py-3 px-6">
                        <h4 className="py-2 text-lg font-medium flex-grow">
                          งานที่ได้รับ
                        </h4>
                        <AcademicCapIcon className="w-10 h-10" />
                      </div>
                      <div className="relative flex flex-col border p-4 rounded-b-lg font-light text-gray-800 dark:text-gray-100 bg-gray-100 dark:bg-gray-800">
                        {classroom
                          ? classroom.length === 0
                            ? "ยังไม่ได้เชื่อมต่อกับ Google Classroom"
                            : work + " งานทั้งหมดในสัปดาห์นี้"
                          : "กำลังโหลด..."}
                        <Link href="/work">
                          <a className="p-2 font-normal text-right sticky bottom-0 text-yellow-500 hover:text-yellow-600 underline">
                            ดูเพิ่มเติม
                          </a>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                <AnnouncementComponent
                  show={showAnnounce}
                  onClose={() => setAnnounce(false)}
                />
                {!metadata.upgrade && <WelcomeComponent />}
              </>
            ) : (
              <>
                <Transition
                  show={hero}
                  className="md:absolute left-20 top-8 flex flex-col text-white space-y-6 xl:px-8 md:px-0 px-8 py-8 md:items-start items-center xl:max-w-2xl lg:max-w-lg md:max-w-md font-light"
                >
                  <Transition.Child
                    as="h1"
                    enter="transform transition duration-700"
                    enterFrom="opacity-50 scale-150"
                    enterTo="opactity-100 scale-100"
                    className="text-4xl font-medium filter drop-shadow-xl md:text-left text-center"
                  >
                    เครื่องมือเดียวสำหรับการเรียนออนไลน์
                  </Transition.Child>
                  <Transition.Child
                    as="div"
                    enter="transition-opacity ease-linear duration-700 delay-1000"
                    enterFrom="opacity-0"
                    enterTo="opactity-100"
                    className="flex flex-col flex-1 space-y-6 md:items-start items-center justify-center"
                  >
                    <p className="md:text-left md:px-0 px-8 text-center filter">
                      จะมานั่งกรอกรหัสซ้ำ ๆ ทุกคาบเรียนทำไม เพียงแค่ 3 ขั้นตอน
                      คุณก็สามารถเริ่มต้นเข้าเรียนออนไลน์ ดูตารางสอน
                      จัดการงานที่ได้รับมอบหมาย ได้ทุกวิชา ทุกระดับชั้น
                      และทุกอุปกรณ์
                    </p>
                    <p className="text-center lg:text-white md:text-gray-900 text-white font-medium">
                      และใช่ ทั้งหมดนั่นรวมอยู่ในนี้ให้คุณแล้ว
                    </p>
                  </Transition.Child>
                </Transition>
                <div className="rounded-lg border shadow-xl flex flex-col bg-white text-black items-center justify-start">
                  {user ? (
                    <>
                      <MultiComponent title="ขั้นตอนสุดท้ายเท่านั้น">
                        <MetaDataComponent />
                      </MultiComponent>
                    </>
                  ) : (
                    <MultiComponent
                      title="ยินดีต้อนรับ"
                      desc="เข้าสู่ระบบหรือลงทะเบียนเพื่อเริ่มต้นใช้งาน"
                    >
                      <SignInComponent />
                    </MultiComponent>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </LayoutComponent>
      <PWAPromoComponent show={false} />
      {ready && !metadata && (
        <footer className="bottom-0 bg-white bg-opacity-30 text-black text-sm gap-2 flex flex-col justify-center items-center w-full p-8 border-t">
          <div className="flex flex-row justify-center text-center items-center w-full space-x-4">
            <a
              href="/about"
              target="_blank"
              rel="noopener"
              className="font-normal underline"
            >
              เกี่ยวกับเรา
            </a>
            <a
              href="/support"
              target="_blank"
              rel="noopener noreferrer"
              className="font-normal underline"
            >
              แจ้งปัญหาการใช้งาน / ติดต่อ
            </a>
          </div>

          <span className="text-gray-800">Version 2.0 (@next)</span>
        </footer>
      )}
    </div>
  );
}
