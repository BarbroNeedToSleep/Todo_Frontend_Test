
import axios from "axios";

const API_BASE_URL = "http://localhost:9090/api";

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
});

// Add token to all requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ---- Todo API calls ----
export const getTodos = async () => {
    const res = await api.get("/todo");
    return res.data;
};

export const createTodo = async (todoData, files = []) => {
    const formData = new FormData();

    // Backend expects a STRING part named "todo"
    formData.append("todo", JSON.stringify(todoData));

    // NOW we add file uploads 🟦
    files.forEach((file) => formData.append("files", file));

    const res = await api.post("/todo", formData);
    return res.data;
};

export const updateTodo = async (id, todoData, files = []) => {
    const formData = new FormData();

    // Same backend requirement as createTodo
    formData.append("todo", JSON.stringify(todoData));

    // Add attachments (new ones only)
    files.forEach((file) => formData.append("files", file));

    const res = await api.put(`/todo/${id}`, formData);
    return res.data;
};


export const deleteTodo = async (id) => {
    const res = await api.delete(`/todo/${id}`);
    return res.data;
};
