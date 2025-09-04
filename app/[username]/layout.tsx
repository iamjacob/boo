// app/@[username]/layout.tsx
import type { Metadata } from "next"
import Time from '../Time'
import BoooksFull from "../BoooksFull";

type Props = {
  children: React.ReactNode
  params: { username: string }
}

// ✅ Dynamic metadata per username
export async function generateMetadata(
  { params }: { params: { username: string } }
): Promise<Metadata> {
  const { username } = await params

  return {
    title: `@${username}`,
    description: `${username}'s profile and bookshelf on Boooks`,
  }
}

export default function UserLayout({ children }: Props) {
  return <>
    {/* <header className="absolute z-100 top-0 right-0 w-screen flex justify-between w-screen h-[40px] gap-2">
          <div className="menu flex cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left-icon lucide-chevron-left"><path d="m15 18-6-6 6-6"/></svg>

            <div className="pt-[3px] cursor-pointer">
              <BoooksFull/>


            </div>
          </div>

          <div className="time flex flex-col m-2">
            <div className="login">Login</div>

            {/* <div className="TAG flex px-1 py-[0px] my-[0px] justify-around items-center">
              <div className="border border-1 border-black-100 h-[4px] w-[4px] rounded-full"></div>
              <div className="border border-1 border-black-100 h-1 w-1 rounded-full"></div>
              <div className="border border-1 border-black-100 h-1 w-1 rounded-full"></div>
          </div>
            </div> 
        </header> */}

  {children}</>
}
