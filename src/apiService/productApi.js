import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getAuthHeaders() {
    const token =
        typeof window !== "undefined"
            ? sessionStorage.getItem("pm_admin_token")
            : null;

    return token
        ? {
              Authorization: `Bearer ${token}`,
          }
        : {};
}

function toInteger(value) {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
}

function getErrorResponse(
    error,
    defaultMessage
) {
    if (error?.response) {
        console.error(
            "HTTP Status:",
            error.response.status
        );

        console.error(
            "Server Response:",
            error.response.data
        );

        let message = defaultMessage;

        if (
            typeof error.response.data ===
            "string"
        ) {
            const text =
                error.response.data;

            const match = text.match(
                /<pre>(.*?)<\/pre>/s
            );

            message =
                match?.[1] ||
                text ||
                defaultMessage;
        } else if (
            error.response.data?.message
        ) {
            message =
                error.response.data.message;
        }

        return {
            success: false,
            message,
            status: error.response.status,
            error: error.response.data,
        };
    }

    if (error?.request) {
        console.error(
            "No response received from server."
        );

        return {
            success: false,
            message:
                "No response received from server.",
        };
    }

    console.error(
        "Request error:",
        error?.message
    );

    return {
        success: false,
        message:
            error?.message ||
            defaultMessage,
    };
}


export const createProductFormData = (productData) => {
    const formData = new FormData();
    const {
        id,           
        categoryId,  
        featuredimg,
        images,
        variants,
        faqs,
        howToUse,
        keyBenefits,
        safetyInformation,
        whatToAvoid,
        whoShouldUse,
        whychooseus,
        tags,
        seo,
        isFeatured,
        ...rest
    } = productData;

    Object.entries(rest).forEach(([key, value]) => {
        if (value === null || value === undefined) {
            return;
        }
        formData.append(key, value);
    });

    if (categoryId !== null && categoryId !== undefined) {
        formData.append("category", categoryId);
    }

    formData.append("isFeatured", JSON.stringify(isFeatured));

    if (seo) {
        formData.append("seo", JSON.stringify(seo));
    }

    const jsonArrayFields = {
        faqs, howToUse, keyBenefits, safetyInformation,
        whatToAvoid, whoShouldUse, whychooseus, tags, variants,
    };

    Object.entries(jsonArrayFields).forEach(([key, value]) => {
        if (value !== undefined) {
            formData.append(key, JSON.stringify(value ?? []));
        }
    });

    if (featuredimg instanceof File) {
        formData.append("featuredimg", featuredimg);
    } else if (featuredimg) {
        formData.append("featuredimg", featuredimg);
    }

    if (Array.isArray(images)) {
        const existingImages = [];
        images.forEach((img) => {
            if (img instanceof File) {
                formData.append("images", img);
            } else {
                existingImages.push(img);
            }
        });
        if (existingImages.length > 0) {
            formData.append("existingImages", JSON.stringify(existingImages));
        }
    }

    return formData;
};
 
export const getProduct = async () => {
    try {
        const response = await axios.get(
            API_URL,
            {
                headers: {
                    ...getAuthHeaders(),
                    Accept:
                        "application/json",
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error(
            "Get products failed:",
            error
        );

        return getErrorResponse(
            error,
            "Failed to load products"
        );
    }
};

export const deleteProduct = async (id) => {
    try {
        // const productId = toInteger(id);

        if (productId === null) {
            return {
                success: false,
                message:
                    "Invalid product ID",
            };
        }

        const response =
            await axios.delete(
                `${API_URL}${productId}`,
                {
                    headers: {
                        ...getAuthHeaders(),
                        Accept:
                            "application/json",
                    },
                }
            );

        return response.data;
    } catch (error) {
        console.error(
            "Delete product failed:",
            error
        );

        return getErrorResponse(
            error,
            "Failed to delete product"
        );
    }
};

export const updateProduct = async (
    id,
    productData
) => {
    try {
        const productId = toInteger(id);

        if (productId === null) {
            return {
                success: false,
                message:
                    "Invalid product ID",
            };
        }

        const formData =
            createProductFormData(
                productData
            );

        const response =
            await axios.put(
                `${API_URL}${productId}`,
                formData,
                {
                    headers: {
                        ...getAuthHeaders(),
                        Accept:
                            "application/json",
                    },
                }
            );

        console.log(
            "UPDATE PRODUCT RESPONSE:",
            response.data
        );

        return response.data;
    } catch (error) {
        console.error(
            "Update product failed:",
            error
        );

        return getErrorResponse(
            error,
            "Product update failed"
        );
    }
};

export const createProduct = async (
    productData
) => {
    try {
        const formData =
            createProductFormData(
                productData
            );

        const response =
            await axios.post(
                API_URL,
                formData,
                {
                    headers: {
                        ...getAuthHeaders(),
                        Accept:
                            "application/json",
                    },
                }
            );

        console.log(
            "CREATE PRODUCT RESPONSE:",
            response.data
        );

        return response.data;
    } catch (error) {
        console.error(
            "Create product failed:",
            error
        );

        return getErrorResponse(
            error,
            "Product creation failed"
        );
    }
};