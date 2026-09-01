import axios from "axios";

export const getCoupon = async () => {
    try{
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/dashboard/coupons`,
            {
                headers:{
                    "Content-Type":"application/json",
                    Authorization:`Bearer ${sessionStorage.getItem("pm_admin_token")}`
                }
            }
        );

        console.log(response.data)

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

export const createCoupon = async (couponData) => {
    try{
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/dashboard/coupons`,
            couponData,
            {
                headers:{
                    "Content-Type": "application/json",
                    Authorization:`Bearer ${sessionStorage.getItem("pm_admin_token")}`
                }
            }
        );


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

export const updateCoupon = async (id, couponData) => {
    try{
        const response = await axios.put(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/dashboard/coupons/${id}`,
            couponData,
            {
                headers:{
                    "Content-Type": "application/json",
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

export const deleteCoupon = async (id) => {
    try{
        const response = await axios.delete(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/dashboard/coupons/${id}`,
            {
                headers:{
                    "Content-Type":"application/json",
                    Authorization:`Bearer ${sessionStorage.getItem("pm_admin_token")}`
                }
            }
        );

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