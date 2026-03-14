export default function SupportingDocumentButton() {
    return (
        <button
            className="btn btn-primary btn-sm d-flex align-items-center gap-2 "
            data-bs-toggle="modal"
            data-bs-target="#manage-docs"
        >
            <span className="material-symbols-outlined fs-5 m-1">attach_file</span>
            Documents
        </button>
    )
}