import { clampRating, handleTabbing, numericKeyDown, handlePasteRate, sanitizeNumberInput } from "../../../../utils/inputSanitization";
import SubTaskField from "./SubTaskField";

export default function EditableRatingBadges({ task, isRatingPhase, handleDataChange, onClick }) {


     const onNumberInput = async (e) => {
        sanitizeNumberInput(e)        
        if (e.target && ["quantity","efficiency","timeliness"].includes(e.target.name)) {
            let sanitized = clampRating(e.target.value)
            if (sanitized) handleTabbing(e)
            e.target.value = sanitized
        }
         await handleDataChange(e)
    }

    const onNumberBlur = (e) => {
        if (e.target && ["quantity","efficiency","timeliness"].includes(e.target.name)) {
            e.target.value = clampRating(e.target.value)
            handleDataChange(e)
        }
    }
    

    return (
        <div style = {{
            display:"grid",
            gridTemplateColumns:"1fr 1fr 1fr 1fr ",
            gridTemplateRows:"1fr",
            flexGrow:1,
            height:"150px"
        }}>
            <SubTaskField
                field="quantity"
                value={task.quantity}
                onClick={onClick}
                isEditable={isRatingPhase}
                onKeyDown={numericKeyDown}
                onNumberInput={onNumberInput}
                onBlur={onNumberBlur}
                onFocus={(e)=> {e.target.select(); onClick()}}
                onPaste={handlePasteRate}
                min={1}
                max={5}
                style={{width:"100%", height:"100%", textAlign:"center"}}
                rating = {true}
            />
            <SubTaskField
                field="efficiency"
                value={task.efficiency}
                onClick={onClick}
                isEditable={isRatingPhase}
                onKeyDown={numericKeyDown}
                onNumberInput={onNumberInput}
                onBlur={onNumberBlur}
                onFocus={(e)=> {e.target.select(); onClick()}}
                onPaste={handlePasteRate}
                min={1}
                max={5}
                style={{width:"100%", height:"100%", textAlign:"center"}}
                rating = {true}
            />
            <SubTaskField
                field="timeliness"
                value={task.timeliness}
                onClick={onClick}
                isEditable={isRatingPhase}
                onKeyDown={numericKeyDown}
                onNumberInput={onNumberInput}
                onBlur={onNumberBlur}
                onFocus={(e)=> {e.target.select(); onClick()}}
                onPaste={handlePasteRate}
                min={1}
                max={5}
                style={{width:"100%", height:"100%", textAlign:"center"}}
                rating = {true}
            />
            
            <div className="text-center" >
                <input 
                    type="number" className="form-control form-control-sm no-spinner text-center" 
                    value = {parseFloat(task.average).toFixed(1)} 
                    style={{width:"100%", height:"100%"}}
                    disabled={true}
                />
            </div>
        </div>
    )
}