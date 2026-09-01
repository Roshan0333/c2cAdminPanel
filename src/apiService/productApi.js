import axios from "axios";

export const getProduct = async () => {
    try {
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${sessionStorage.getItem("pm_admin_token")}`
                }
            }
        )

        console.log(response.data)
        return response.data
    }
    catch (err) {
        if (err.response) {
            if (err.response) {
                console.error("Server Error:", err.response.status);
                console.error("Response:", err.response.data);
            } else if (err.request) {
                console.error("No response received from server.");
            } else {
                console.error("Request error:", err.message);
            }

            return err.response?.data;
        }

        return null;
    }
}

export const deleteProduct = async (id) => {
    console.log(`${process.env.NEXT_PUBLIC_API_URL}${id}`)
    try {
        const response = await axios.delete(
            `${process.env.NEXT_PUBLIC_API_URL}${String(id).trim()}`,
            {
                headers:{
                    "Content-Type":"application/json",
                    Authorization: `Bearer ${sessionStorage.getItem("pm_admin_token")}`
                }
            }
        )
        return response.data
    }
    catch (err) {
        if (err.response) {
            if (err.response) {
                console.error("Server Error:", err.response.status);
                console.error("Response:", err.response.data);
            } else if (err.request) {
                console.error("No response received from server.");
            } else {
                console.error("Request error:", err.message);
            }

            return err.response?.data;
        }

        return null;
    }
}

export const updateProduct = async (productData, id) => {
    try{
        const response  = await axios.put(
            `${process.env.NEXT_PUBLIC_API_URL}${String(id).trim()}`,
            productData,
            {
                headers:{
                    "Content-Type": "multipart/form-data",
                    Authorization:`Bearer ${sessionStorage.getItem("pm_admin_token")}`
                }
            }
        );

        console.log(response.data);
        return response.data
    }
    catch(err){
        if (err.response) {
            if (err.response) {
                console.error("Server Error:", err.response.status);
                console.error("Response:", err.response.data);
            } else if (err.request) {
                console.error("No response received from server.");
            } else {
                console.error("Request error:", err.message);
            }

            return err.response?.data;
        }

        return null;
    }
}

export const createProduct = async (productData) => {
        try{
        const response  = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}`,
            productData,
            {
                headers:{
                    "Content-Type": "multipart/form-data",
                    Authorization:`Bearer ${sessionStorage.getItem("pm_admin_token")}`
                }
            }
        );

        console.log(response.data);
        return response.data
    }
    catch(err){
        if (err.response) {
            if (err.response) {
                console.error("Server Error:", err.response.status);
                console.error("Response:", err.response.data);
            } else if (err.request) {
                console.error("No response received from server.");
            } else {
                console.error("Request error:", err.message);
            }

            return err.response?.data;
        }

        return null;
    }
}