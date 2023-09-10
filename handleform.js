/*$(document).ready(function () {
    // Attach a click event listener to the submit button
    $(".submit").click(function () {
        // Collect form data
        var formData = {
            investmentObjective: $("#investment-objective").val(),
            riskTolerance: $("#risk-tolerance").val(),
            preferredRegions: $("#preferred-regions").val(),
            preferredSectors: $("#preferred-sectors").val(),
            investmentTimeHorizon: $("#investment-time-horizon").val()
        };

        // Send data to server
        $.ajax({
            type: "POST",
            url: "http://localhost:3001/api/business-suggestions",
            data: JSON.stringify(formData),
            contentType: "application/json",
            success: function (response) {
                // Clear the results div
                $(".results").empty();

                // Add the best country and explanation to the results div
                $(".results").append("<h2>Recommended Country: " + response.bestCountryId + "</h2>");
                $(".results").append("<h3>Score: " + response.bestCountryScore.toFixed(2) + "</h3>");
                $(".results").append("<ul>");
                for (let explanation of response.bestCountryExplanation) {
                    $(".results").append("<li>" + explanation + "</li>");
                }
                $(".results").append("</ul>");
            }
        });
    });
});
*/