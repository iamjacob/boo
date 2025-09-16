import React from "react";
export default function BookMenuButton() {
    return (
        <div className="mx-3 my-3">
            <div className="flex flex-row justify-around items-end w-[18px] h-4 cursor-pointer">
                <div className="w-[3px] h-[14px] border-1 border-[#ff0000] bg-[#ff000050] rounded-[4px]" />
                <div className="w-[3px] h-[12px] border-1 border-[#ff0000] bg-[#ff000050] rounded-[4px]" />
                <div className="w-[3px] h-[16px] border-1 border-[#ff0000] bg-[#ff000050] rounded-[4px]" />
            </div>
        </div>
    );
}
