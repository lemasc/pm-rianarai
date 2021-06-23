import Head from "next/head";
import LayoutComponent, { CONTAINER, HEADER } from "../components/layout";
import MetadataComponent from "../components/meta";

export default function SettingsPage(): JSX.Element {
  return (
    <div className="overflow-hidden min-h-screen flex flex-col dark:bg-gray-900 dark:text-white items-center justify-center">
      <Head>
        <title>การตั้งค่า - PM-RianArai</title>
      </Head>
      <LayoutComponent>
        <div className={CONTAINER}>
          <h1 className={HEADER}>การตั้งค่า</h1>
          <div className="grid">
            <div className="p-4 md:mx-8 border rounded bg-gray-500 dark:bg-gray-800">
              <h2 className="text-2xl font-medium p-8">ข้อมูลส่วนตัว</h2>
              <MetadataComponent />
            </div>
          </div>
        </div>
      </LayoutComponent>
    </div>
  );
}
