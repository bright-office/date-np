import type { DetailedHTMLProps, LabelHTMLAttributes } from "react";
import { cn } from "../../utils/clsx";


type tlabelprops = {
    required?: boolean;
    className?: string;
    children?: React.ReactNode;
} & DetailedHTMLProps<LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>

const Label = (props: tlabelprops) => {
    const {
        required = false,
        className = "",
        children,
        ...labelProps
    } = props;

    return (
        <label
            className={cn("text-sm font-[400] text-t-300 dark:text-gray-500 capitalize", className)}
            {...labelProps}
        >
            {children}
            {props.required &&
                <span className="text-red-500"> * </span>
}
        </label>
    )
}

export default Label;