import React from "react";
export default function BookMenuButton() {
    return (
            <div className="flex mx-3 my-3 flex-row justify-around items-end w-[18px] h-4 cursor-pointer">
                <div className="w-[3px] h-[14px] border border-[#ff0000] rounded-[4px]" />
                <div className="w-[3px] h-[12px] border border-[#ff0000] rounded-[4px]" />
                <div className="w-[3px] h-[16px] border border-[#ff0000] rounded-[4px]" />
            </div>
    );
}
