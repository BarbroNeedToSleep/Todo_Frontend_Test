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

    const [filterMode, setFilterMode] = useState("all");   // all | overdue | completed | pending | mehrdad | simon
    const [sortMode, setSortMode] = useState("none");      // none | title-asc | due-asc



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

            // Build a minimal payload the backend understands
            const payload = {
                title: todo.title,
                description: todo.description,
                dueDate: todo.dueDate || null,
                personId: todo.personId ?? null,
                completed: !todo.completed, // 👈 only field we actually change
            };

            const updated = await updateTodo(todo.id, payload);

            setTodos((prev) =>
                prev.map((t) => (t.id === todo.id ? updated : t))
            );
        } catch (err) {
            console.error(err);
            setError("Could not update completed status.");
        }
    };




    const now = new Date();

// start from all todos
    let displayedTodos = [...todos];

// 1) FILTER
    displayedTodos = displayedTodos.filter((todo) => {
        const hasDue = !!todo.dueDate;
        const dueTime = hasDue ? new Date(todo.dueDate).getTime() : null;

        switch (filterMode) {
            case "overdue":
                // has a due date, in the past, and not completed
                return hasDue && dueTime < now.getTime() && !todo.completed;
            case "completed":
                return todo.completed === true;
            case "pending":
                return !todo.completed;
            case "mehrdad":
                return todo.personId === 1;
            case "simon":
                return todo.personId === 2;
            case "all":
            default:
                return true;
        }
    });

// 2) SORT
    displayedTodos.sort((a, b) => {
        if (sortMode === "title-asc") {
            return (a.title || "").localeCompare(b.title || "");
        }

        if (sortMode === "title-desc") {
            return (b.title || "").localeCompare(a.title || "");
        }

        if (sortMode === "due-asc") {
            const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY;
            const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY;
            return aTime - bTime;
        }

        if (sortMode === "due-desc") {
            const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Number.NEGATIVE_INFINITY;
            const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Number.NEGATIVE_INFINITY;
            return bTime - aTime;
        }

        // "none" or unknown → keep original order
        return 0;
    });



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
                                            {/* Filter dropdown */}
                                            <div className="dropdown me-1">
                                                <button
                                                    className="btn btn-outline-secondary btn-sm dropdown-toggle"
                                                    type="button"
                                                    id="filterDropdown"
                                                    data-bs-toggle="dropdown"
                                                    aria-expanded="false"
                                                    title={`Filter: ${filterMode}`}
                                                >
                                                    <i className="bi bi-funnel"></i>
                                                </button>
                                                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="filterDropdown">
                                                    <li>
                                                        <button className="dropdown-item" onClick={() => setFilterMode("all")}>
                                                            All tasks
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button className="dropdown-item" onClick={() => setFilterMode("overdue")}>
                                                            Overdue
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button className="dropdown-item" onClick={() => setFilterMode("completed")}>
                                                            Completed
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button className="dropdown-item" onClick={() => setFilterMode("pending")}>
                                                            Pending
                                                        </button>
                                                    </li>
                                                    <li><hr className="dropdown-divider" /></li>
                                                    <li>
                                                        <button className="dropdown-item" onClick={() => setFilterMode("mehrdad")}>
                                                            Assigned to Mehrdad
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button className="dropdown-item" onClick={() => setFilterMode("simon")}>
                                                            Assigned to Simon
                                                        </button>
                                                    </li>
                                                </ul>
                                            </div>

                                            {/* Sort dropdown */}
                                            <div className="dropdown">
                                                <button
                                                    className="btn btn-outline-secondary btn-sm dropdown-toggle"
                                                    type="button"
                                                    id="sortDropdown"
                                                    data-bs-toggle="dropdown"
                                                    aria-expanded="false"
                                                    title={`Sort: ${sortMode}`}
                                                >
                                                    <i className="bi bi-sort-down"></i>
                                                </button>
                                                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="sortDropdown">
                                                    <li>
                                                        <button className="dropdown-item" onClick={() => setSortMode("none")}>
                                                            Default order
                                                        </button>
                                                    </li>
                                                    <li><hr className="dropdown-divider" /></li>
                                                    <li>
                                                        <button className="dropdown-item" onClick={() => setSortMode("title-asc")}>
                                                            Title A → Z
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button className="dropdown-item" onClick={() => setSortMode("title-desc")}>
                                                            Title Z → A
                                                        </button>
                                                    </li>
                                                    <li><hr className="dropdown-divider" /></li>
                                                    <li>
                                                        <button className="dropdown-item" onClick={() => setSortMode("due-asc")}>
                                                            Due date: earliest first
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button className="dropdown-item" onClick={() => setSortMode("due-desc")}>
                                                            Due date: latest first
                                                        </button>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>


                                </div>
                                <div className="card-body">
                                    {error && (
                                        <div className="alert alert-danger" role="alert">
                                            {error}
                                        </div>
                                    )}

                                    {displayedTodos.length === 0 ? (
                                        <p className="text-muted mb-0">No tasks found.</p>
                                    ) : (
                                        <div className="list-group">
                                            {displayedTodos.map((todo) => (

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
