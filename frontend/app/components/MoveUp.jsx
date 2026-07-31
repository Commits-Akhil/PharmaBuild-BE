import { ArrowUp } from "lucide-react";
export default function MoveUp(){
    return(
        <>
            <div className="fixed bottom-5 right-5 z-10">
                
                    <div className="bg-green-500 rounded-full cursor-pointer p-4 hover:bg-green-700 transition-transform hover:scale-105">
                    <ArrowUp />
                </div>

            </div>
        </>
    );
}