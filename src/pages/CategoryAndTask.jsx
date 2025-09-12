import { useState } from "react";
import "../assets/styles/CategoryAndTask.css"
import SubmissionsChart from "../components/Barchart";

function CategoryAndTask(){
    return (
        <div className="category-task-container">
            <div className="all-categories-container">
                <div className="sidebar-title">
                    Categories
                </div>
                <div className="add-category-container">
                    <button className="add-category">
                        <span className="material-symbols-outlined">add</span>
                        <span>Add Category</span>
                    </button>
                    <input type="text" placeholder="Search Category"/>
                </div>
                <div className = "all-categories">
                    <div className="department">
                        <span className="material-symbols-outlined">category</span>
                        <span>School Leadership and Management Services</span>
                    </div>
                    <div className="department">
                        <span className="material-symbols-outlined">category</span>
                        <span>Curriculum and Instructions</span>
                    </div>
                    <div className="department">
                        <span className="material-symbols-outlined">category</span>
                        <span>Research Services</span>
                    </div>
                </div>  
            </div>

            <div className="category-main-container">
                <div className="tasks-average-rating">
                    <span className="graph-title">Average Rating per Task</span>
                    <SubmissionsChart></SubmissionsChart>
                </div>
                
                <div className="all-tasks-container">
                    <span className="all-tasks-title">Tasks</span>
                    <div className="all-tasks">
                        <div className="task">
                            <div className="task-title">
                                <span className="material-symbols-outlined">highlight_mouse_cursor</span>
                                <span>Periodical Examination</span>
                            </div>
                            <div className="task-description">
                                Evaluates and prepares summary reports of student's grades per grading period.		
                            </div>
                        </div>
                        <div className="task">
                            <div className="task-title">
                                <span className="material-symbols-outlined">highlight_mouse_cursor</span>
                                <span>Periodical Examination</span>
                            </div>
                            <div className="task-description">
                                Evaluates and prepares summary reports of student's grades per grading period.		
                            </div>
                        </div>
                        <div className="task">
                            <div className="task-title">
                                <span className="material-symbols-outlined">highlight_mouse_cursor</span>
                                <span>Periodical Examination</span>
                            </div>
                            <div className="task-description">
                                Evaluates and prepares summary reports of student's grades per grading period.		
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default CategoryAndTask