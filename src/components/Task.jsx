import React, { useEffect, useState, useRef } from "react";
import "./Task.css";
import Sidebar from "./Sidebar";
import Header from "./Header.jsx";
import { getTodos, createTodo, updateTodo, deleteTodo } from "../services/taskService";


const Task = () => {
    const [todos, setTodos] = useState([]);
    const [error, setError] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [editingTodo, setEditingTodo] = useState(null);
    const [personId, setPersonId] = useState("");
    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);



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

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setError("");

            if (editingTodo) {
                await handleUpdateTodo(
                    editingTodo,
                    {
                        title,
                        description,
                        dueDate: dueDate || null,
                        personId: personId ? Number(personId) : null,
                    },
                    files
                );
            } else {
                const newTodo = await createTodo(
                    {
                        title,
                        description,
                        dueDate: dueDate || null,
                        personId: personId ? Number(personId) : null,
                    },
                    files
                );

                setTodos((prev) => [...prev, newTodo]);
            }

            setTitle("");
            setDescription("");
            setEditingTodo(null);
            setDueDate("");
            setPersonId("");
            setFiles([]);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }


        } catch (err) {
            console.error(err);
            setError(editingTodo ? "Could not update task." : "Could not create task.");
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

    const handleUpdateTodo = async (todo, updatedFields, filesToUpload = []) => {
        try {
            setError("");

            const updatedTodoData = {
                ...todo,
                ...updatedFields,
            };

            const updated = await updateTodo(todo.id, updatedTodoData, filesToUpload);

            setTodos((prev) =>
                prev.map((t) => (t.id === todo.id ? updated : t))
            );
        } catch (err) {
            console.error(err);
            setError("Could not update task.");
        }
    };

    const handleClearFiles = () => {
        setFiles([]);              // clear list in state
        if (fileInputRef.current) {
            fileInputRef.current.value = "";  // clear actual input
        }
    };


    const handleToggleComplete = async (todo) => {
        try {
            setError("");

            const updated = await updateTodo(todo.id, {
                ...todo,
                completed: !todo.completed
            });

            setTodos((prev) =>
                prev.map((t) => (t.id === todo.id ? updated : t))
            );
        } catch (err) {
            console.error(err);
            setError("Could not update completed status.");
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
                                    <form id="todoForm" onSubmit={handleSubmit}>
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
                                                    value={dueDate}
                                                    onChange={(e) => setDueDate(e.target.value)}
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="todoPerson" className="form-label">
                                                    Assign to Person
                                                </label>
                                                <select
                                                    className="form-select"
                                                    id="todoPerson"
                                                    value={personId}
                                                    onChange={(e) => setPersonId(e.target.value)}
                                                >
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
                                                    ref={fileInputRef}
                                                    onChange={(e) => setFiles(Array.from(e.target.files))}  // 👈 NEW
                                                />
                                                <button
                                                    className="btn btn-outline-secondary"
                                                    type="button"
                                                    onClick={handleClearFiles}
                                                >
                                                    <i className="bi bi-x-lg"></i>
                                                </button>

                                            </div>
                                            <div className="file-list" id="attachmentPreview">
                                                {files.length > 0 && (
                                                    <ul className="list-unstyled mb-0">
                                                        {files.map((file) => (
                                                            <li key={file.name} className="small text-muted">
                                                                {file.name}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>

                                        </div>
                                        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                            <button type="submit" className="btn btn-primary">
                                                <i className="bi bi-plus-lg me-2"></i>
                                                {editingTodo ? "Save Changes" : "Add Task"}
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
                                                                    <small
                                                                        className={
                                                                            new Date(todo.dueDate) < new Date()
                                                                                ? "text-danger me-2"
                                                                                : "text-muted me-2"
                                                                        }
                                                                    >
                                                                        <i className="bi bi-calendar-event"></i>{" "}
                                                                        Due: {todo.dueDate}
                                                                    </small>
                                                                )}
                                                                {todo.personId && (
                                                                    <span className="badge bg-info me-2">
                                                                        <i className="bi bi-person"></i>{" "}
                                                                        {todo.personId === 1
                                                                            ? "Mehrdad Javan"
                                                                            : todo.personId === 2
                                                                                ? "Simon Elbrink"
                                                                                : `Person #${todo.personId}`}
                                                                            </span>
                                                                            )}
                                                                    {todo.numberOfAttachments > 0 && (
                                                                    <span className="badge bg-light text-muted border me-2">
                                                                        <i className="bi bi-paperclip"></i>{" "}
                                                                        {todo.numberOfAttachments} attachment
                                                                        {todo.numberOfAttachments !== 1 && "s"}
                                                                        </span>
                                                                        )}
                                                                            <span
                                                                        className={
                                                                        todo.completed
                                                                            ? "badge bg-success me-2"
                                                                            : "badge bg-warning text-dark me-2"
                                                                            }
                                                                            >
                                                                            {todo.completed ? "Completed" : "Pending"}
                                                                        </span>
                                                            </div>
                                                        </div>
                                                        <div className="btn-group ms-3">
                                                            <button
                                                                className="btn btn-outline-success btn-sm"
                                                                title={todo.completed ? "Mark as Not Completed" : "Mark as Completed"}
                                                                onClick={() => handleToggleComplete(todo)}
                                                            >
                                                                <i className="bi bi-check-lg"></i>
                                                            </button>

                                                            <button
                                                                className="btn btn-outline-primary btn-sm"
                                                                title="Edit"
                                                                onClick={() => {
                                                                    setEditingTodo(todo);
                                                                    setTitle(todo.title || "");
                                                                    setDescription(todo.description || "");
                                                                    setDueDate(
                                                                        todo.dueDate
                                                                            ? todo.dueDate.slice(0, 16)  // "2025-12-05T18:53"
                                                                            : ""
                                                                    );
                                                                    setPersonId(
                                                                        todo.personId
                                                                            ? String(todo.personId)
                                                                            : ""
                                                                    );
                                                                }} >
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
