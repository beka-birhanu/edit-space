
function Navbar() {

    return (
        <nav className="flex w-full flex-start">
            <div 
                className="
                bg-white w-full max-w-default h-20 mx-auto mt-4 rounded-2xl
                shadow-sm flex items-center justify-between px-8
                "
            >
                <span className="text-lg font-bold text-gray-600">
                    Edit Wars
                </span>
            </div>
        </nav>
    )
}

export default Navbar;