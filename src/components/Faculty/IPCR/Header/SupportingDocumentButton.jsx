import { Button } from "@mui/material";

import ArticleIcon from '@mui/icons-material/Article';
export default function SupportingDocumentButton() {
    return (
        <Button
            variant="outlined"
            data-bs-toggle="modal"
            data-bs-target="#manage-docs"
            startIcon={<ArticleIcon />}
        >
            Documents
        </Button>
    )
}