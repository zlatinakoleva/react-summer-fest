export const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const dateOptions = { hour: 'numeric', minute: 'numeric', year: 'numeric', month: 'numeric', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', dateOptions);
    return formattedDate;
}
