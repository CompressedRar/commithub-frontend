

export function formatDateDeadline(date){
    console.log(date)
    return new Date(date).getMonth().toString() + " - "+ new Date(date).getDate().toString() + " - " + new Date(date).getFullYear().toString();
}

export function formatDateForInput(dateString) {
    if (!dateString) return "";

    try {
        // Handle both ISO 8601 and other date formats
        const date = new Date(dateString);

        // Check if date is valid
        if (isNaN(date.getTime())) {
            console.warn("Invalid date:", dateString);
            return "";
        }

        // Convert to YYYY-MM-DD format (required by date input)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    } catch (error) {
        console.error("Error formatting date:", error);
        return "";
    }
}