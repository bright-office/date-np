interface RangeWeekRowProps {
    locale: "en" | "ne";
    lan?: "en" | "ne";
}

export const RangeWeekRow = ({ locale, lan='en' }: RangeWeekRowProps) => {
    const weekNames = locale === "en" || lan === 'en'
        ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        : locale === "ne" && lan === 'ne'
            ? ["आइत", "सोम", "मंगल", "बुध", "बृहस्पति", "शुक्र", "शनि"]
            : [];

    return (
        <>
            {weekNames.map((name, index) => {
                return (
                    <div key={index} className="w-full h-full grid place-items-center font-medium text-gray-500 text-sm tracking-wide">
                        {name}
                    </div>
                )
            })}
        </>
    )
};
