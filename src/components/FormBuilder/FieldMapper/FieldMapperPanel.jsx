import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { GridView as GridViewIcon } from "@mui/icons-material";
import { useState } from "react";
import FieldMapper from "./FieldMapper";

export default function FieldMapperPanel({ fields = [], outputFields = [] }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <Box>
            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center" gap={1}>
                            <GridViewIcon />
                            <Typography variant="h6">Field Mapper</Typography>
                        </Box>
                        <Button
                            variant={expanded ? "contained" : "outlined"}
                            onClick={() => setExpanded(!expanded)}
                        >
                            {expanded ? "Hide Mapper" : "Open Mapper"}
                        </Button>
                    </Box>
                    {!expanded && (
                        <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                            Arrange your input and output fields in a grid layout, similar to Excel
                        </Typography>
                    )}
                </CardContent>
            </Card>

            {expanded && (
                <Box sx={{ border: "1px solid #ddd", borderRadius: 1, overflow: "hidden" }}>
                    <FieldMapper fields={fields} outputFields={outputFields} />
                </Box>
            )}
        </Box>
    );
}
