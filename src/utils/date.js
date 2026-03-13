

export function formatDateDeadline(date){
    console.log(date)
    return new Date(date).getMonth().toString() + " - "+ new Date(date).getDate().toString() + " - " + new Date(date).getFullYear().toString();
}