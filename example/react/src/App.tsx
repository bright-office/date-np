import Picker from "date-np/picker";
import { RangePicker } from "date-np";

function App() {
    
    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
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
                />
            </div>
        </div>
    )
}

export default App
