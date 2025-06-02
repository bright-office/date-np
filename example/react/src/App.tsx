import Picker from "date-np/picker";
import { RangePicker } from "date-np";

function App() {
    const handleRangeSelect = (startDate: any, endDate: any) => {
        console.log("Range selected:", { startDate, endDate });
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            //justifyContent: 'center',
            alignItems: 'center',
            gap: '40px',
            backgroundImage: "linear-gradient(#fff, #e8e8e8)",
            padding: '20px'
        }}>
            <div style={{ textAlign: 'center' }}>
                <h2 style={{ marginBottom: '20px', color: '#333' }}>Single Date Picker</h2>
                <Picker
                    shouldShowInput={true}
                    inputProps={{
                        label: "Nepali Date",
                    }}
                />
            </div>
            
            <div style={{ textAlign: 'center' }}>
                <h2 style={{ marginBottom: '20px', color: '#333' }}>Range Date Picker</h2>
                <RangePicker
                    shouldShowInput={true}
                    inputProps={{
                        placeholder: "Select date range...",
                    }}
                    onRangeSelect={handleRangeSelect}
                />
            </div>
        </div>
    )
}

export default App
