import React, { useEffect, useState } from "react";
import "./Task.css";
import Sidebar from "./Sidebar";
import Header from "./Header.jsx";
import { getTodos, createTodo, deleteTodo } from "../services/taskService";


const Task = () => {
    const [todos, setTodos] = useState([]);
    const [error, setError] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");


    useEffect(() => {
        const loadTodos = async () => {
            try {
                setError("");
                const data = await getTodos();
                setTodos(data);
            } catch (err) {
                console.error(err);
                setError("Could not load tasks.");
            }
        };

        loadTodos();
    }, []);

    const handleCreateTask = async (e) => {
        e.preventDefault();

        try {
            setError("");

            const newTodo = await createTodo({
                title,
                description,
            });

            // add new task to list
            setTodos((prev) => [...prev, newTodo]);

            // clear form
            setTitle("");
            setDescription("");
        } catch (err) {
            console.error(err);
            setError("Could not create task.");
        }
    };

    const handleDeleteTask = async (id) => {
        try {
            setError("");
            await deleteTodo(id);

            // remove it from local state
            setTodos((prev) => prev.filter((t) => t.id !== id));
        } catch (err) {
            console.error(err);
            setError("Could not delete task.");
        }
    };



    return (
        <div className="dashboard-layout">
            <Sidebar isOpen={false} onClose={() => {}} />
            <main className="dashboard-main">
                <Header
                    title="Tasks"
                    subtitle="Manage and organize your tasks"
                    onToggleSidebar={() => {}}
                />

                <div className="dashboard-content">
                    <div className="row">
                        <div className="col-md-8 mx-auto">
                            {/* Form is still static for now, we'll wire it later */}
                            <div className="card shadow-sm task-form-section">
                                <div className="card-body">
                                    <h2 className="card-title mb-4">Add New To-Do</h2>
                                    <form id="todoForm" onSubmit={handleCreateTask}>
                                        <div className="mb-3">
                                            <label htmlFor="todoTitle" className="form-label">
                                                Title
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="todoTitle"
                                                required
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="todoDescription" className="form-label">
                                                Description
                                            </label>
                                            <textarea
                                                className="form-control"
                                                id="todoDescription"
                                                rows="3"
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                            ></textarea>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="todoDueDate" className="form-label">
                                                    Due Date
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    className="form-control"
                                                    id="todoDueDate"
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="todoPerson" className="form-label">
                                                    Assign to Person
                                                </label>
                                                <select className="form-select" id="todoPerson">
                                                    <option value="">
                                                        -- Select Person (Optional) --
                                                    </option>
                                                    <option value="1">Mehrdad Javan</option>
                                                    <option value="2">Simon Elbrink</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Attachments</label>
                                            <div className="input-group mb-3">
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    id="todoAttachments"
                                                    multiple
                                                />
                                                <button
                                                    className="btn btn-outline-secondary"
                                                    type="button"
                                                >
                                                    <i className="bi bi-x-lg"></i>
                                                </button>
                                            </div>
                                            <div className="file-list" id="attachmentPreview"></div>
                                        </div>
                                        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                            <button type="submit" className="btn btn-primary">
                                                <i className="bi bi-plus-lg me-2"></i>
                                                Add Task
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            <div className="card shadow-sm tasks-list mt-4">
                                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                                    <h5 className="card-title mb-0">Tasks</h5>
                                    <div className="btn-group">
                                        <button
                                            className="btn btn-outline-secondary btn-sm"
                                            title="Filter"
                                        >
                                            <i className="bi bi-funnel"></i>
                                        </button>
                                        <button
                                            className="btn btn-outline-secondary btn-sm"
                                            title="Sort"
                                        >
                                            <i className="bi bi-sort-down"></i>
                                        </button>
                                    </div>
                                </div>
                                <div className="card-body">
                                    {error && (
                                        <div className="alert alert-danger" role="alert">
                                            {error}
                                        </div>
                                    )}

                                    {todos.length === 0 ? (
                                        <p className="text-muted mb-0">No tasks found.</p>
                                    ) : (
                                        <div className="list-group">
                                            {todos.map((todo) => (
                                                <div
                                                    key={todo.id}
                                                    className="list-group-item list-group-item-action"
                                                >
                                                    <div className="d-flex w-100 justify-content-between align-items-start">
                                                        <div className="flex-grow-1">
                                                            <div className="d-flex justify-content-between">
                                                                <h6 className="mb-1">
                                                                    {todo.title || "Untitled task"}
                                                                </h6>
                                                                {/* if backend sends createdDate/createdAt you can show it here */}
                                                            </div>
                                                            {todo.description && (
                                                                <p className="mb-1 text-muted small">
                                                                    {todo.description}
                                                                </p>
                                                            )}
                                                            <div className="d-flex align-items-center flex-wrap">
                                                                {todo.dueDate && (
                                                                    <small className="text-muted me-2">
                                                                        <i className="bi bi-calendar-event"></i>{" "}
                                                                        Due: {todo.dueDate}
                                                                    </small>
                                                                )}
                                                                {todo.status && (
                                                                    <span className="badge bg-secondary me-2">
                                    {todo.status}
                                  </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="btn-group ms-3">
                                                            <button
                                                                className="btn btn-outline-success btn-sm"
                                                                title="Complete"
                                                                disabled
                                                            >
                                                                <i className="bi bi-check-lg"></i>
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-primary btn-sm"
                                                                title="Edit"
                                                                disabled
                                                            >
                                                                <i className="bi bi-pencil"></i>
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-danger btn-sm"
                                                                title="Delete"
                                                                onClick={() => handleDeleteTask(todo.id)}
                                                            >
                                                                <i className="bi bi-trash"></i>
                                                            </button>

                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Task;
