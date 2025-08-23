
import { cn } from "@/lib/utils";

interface LogoProps {
    radius?: number | string | undefined;
    className?: string;
}

function Logo(props: LogoProps) {
    return (
        <div className={cn("rounded-full overflow-hidden w-fit grid place-items-center aspect-square", props.className)}>
            <img src="logo.png" alt="logo" className="w-full h-full" width={props.radius} height={props.radius} />
        </div>
    )
}

export default Logo;