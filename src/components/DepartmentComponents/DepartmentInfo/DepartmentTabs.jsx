import { useState } from "react"

import PerformanceReviews from "./Tabs/Forms/PerformanceReview"
import DepartmentTasksTable from "./Tabs/Tasks/DepartmentTasksTable"
import TaskWeights from "../Tasks/TaskWeights"
import DepartmentMemberTable from "./Tabs/Members/DepartmentMemberTable"
import PCR from "./Tabs/Forms/PCR"

function DepartmentTabs({ deptId, currentPhase }) {

  const [tab, setTab] = useState(0)

  const tabs = [
    { label: "Performance Reviews", icon: "assessment" },
    { label: "Tasks", icon: "task_alt" },
    { label: "Weights", icon: "weight" },
    { label: "Members", icon: "group" }
  ]

  return (
    <>
      <ul className="nav nav-tabs mb-3">

        {tabs.map((t, i) => (
          <li key={i} className="nav-item">

            <button
              onClick={() => setTab(i)}
              className={`nav-link d-flex align-items-center gap-2 ${
                tab === i ? "active" : ""
              }`}
            >
              <span className="material-symbols-outlined">{t.icon}</span>
              {t.label}
            </button>

          </li>
        ))}

      </ul>

      {tab === 0 && (
        
        <PCR deptid={deptId} dept_mode={false} />
      )}

      {tab === 1 && (
        <DepartmentTasksTable
          id={deptId}
          admin_mode={true}
          currentPhase={currentPhase}
        />
      )}

      {tab === 2 && (
        <TaskWeights dept_id={deptId} />
      )}

      {tab === 3 && (
        <DepartmentMemberTable
          deptid={deptId}
          currentPhase={currentPhase}
        />
      )}
    </>
  )
}

export default DepartmentTabs