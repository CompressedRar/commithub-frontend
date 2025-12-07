import IPCRContainer from "../components/Faculty/IPCRContainer"
import "../assets/styles/Faculty.css"
import { useEffect, useState } from "react"
import EditIPCR from "../components/Faculty/EditIPCR"
import { getSettings } from "../services/settingsService"

function Faculty(){
    const [currentPage, setCurrentPage] = useState(0)
    const [currentIPCRID, setCurrentIPCRID] = useState(0)
    const [departmentID, setDepartmentID] = useState(0)

    const [isRatingPeriod, setIsRatingPeriod] = useState(true)

    const [currentPhase, setCurrentPhase] = useState(null) //monitoring, rating, planning

    async function loadCurrentPhase() {
        try {
            const res = await getSettings()
            const phase = res?.data?.data?.current_phase
            console.log("Current phase:", phase)
            setCurrentPhase(phase) //monitoring, rating, planning
        } catch (error) {
            console.error("Failed to load current phase:", error)
        }
    }

    
    function isMonitoringPhase() {
        return currentPhase && Array.isArray(currentPhase) && currentPhase.includes("monitoring")
    }

    function isRatingPhase() {
        return currentPhase && Array.isArray(currentPhase) && currentPhase.includes("rating")
    }

    function isPlanningPhase() {
        return currentPhase && Array.isArray(currentPhase) && currentPhase.includes("planning")
    }

    
    async function checkPeriod() {
      try {
        const res = await getSettings()
        const data = res?.data?.data ?? res?.data ?? {}
        
  
        // determine rating period state (check explicit dates first, then fallbacks)
        try {
          let ratingOpen = true
  
          // prefer explicit start/end fields if present
          console.log("THE SETTINGS DATA: ",data)
          const startField = data.monitoring_start_date
          const endField = data.monitoring_end_date
  
          if (startField || endField) {
            console.log("Evaluating monitoring period from explicit start/end fields", startField, endField)
            try {
              const now = new Date()
              const start = startField ? new Date(startField) : null
              const end = endField ? new Date(endField) : null
  
              console.log("IS MONITORING PERIOD OPEN: ",ratingOpen = now >= start && now <= end)
  
              if (start && end ) {
                ratingOpen = now >= start && now <= end
              } 
              else if (start && !end) {
                ratingOpen = now >= start
              }
              else if (!start && end) {
                ratingOpen = now <= end
              }
              else {
                ratingOpen = false
              }
            } catch (e) {
              console.warn("Monitoring start/end parse error", e)
            }
          } else {
  
            ratingOpen = false
          }
  
          setIsRatingPeriod(!!ratingOpen)
        } catch (e) {
          console.warn("Failed to evaluate rating period from settings", e)
          setIsRatingPeriod(true)
        }
  
      } catch (e) {
        console.warn("failed load formulas", e)
      }
    }

    useEffect(()=> {

        checkPeriod()
        loadCurrentPhase()
    }, [])

    return(
        <div className="faculty-container">
            {currentPage == 0? <IPCRContainer switchPage={(ipcr_id, dept_id)=>{

                if (isMonitoringPhase()) {
                    setTimeout(()=> {
                        setCurrentPage(1)
                        setCurrentIPCRID(ipcr_id)
                        setDepartmentID(dept_id)
                        console.log("switching dept id: ", dept_id)
                    }, 500)
                }
                
                
            }}></IPCRContainer>
            
            : 
            <EditIPCR 
                dept_id = {departmentID} mode = {"faculty"} ipcr_id = {currentIPCRID} 
                switchPage = {()=> {
                setCurrentPage(0)
                setCurrentIPCRID(null)
            }}></EditIPCR>}
            
        </div>
    )
}

export default Faculty